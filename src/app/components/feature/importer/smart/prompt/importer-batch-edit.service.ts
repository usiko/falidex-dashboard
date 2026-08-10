import { Injectable } from '@angular/core';
import {
  DiffReferentialEntityType,
  DiffRelationField,
  DiffRelationFieldKey,
  DiffRow,
  ENTITY_TYPE_LABELS,
  RELATION_FIELD_JSON_KEYS,
  REQUIRED_ADD_FIELDS
} from '../../models/diff-row.model';
import { ImportEntityType, ImportOperation } from './import-batch.model';
import { sortDiffRows } from './importer-review-builder.service';

/**
 * Une ligne du diff et l'opération du batch dont elle est issue, gardées ensemble :
 * l'appariement survit ainsi au tri d'affichage et aux suppressions de lignes.
 */
export interface DiffEntry {
  row: DiffRow;
  operation: ImportOperation;
}

export interface DiffEntriesEdit {
  entries: DiffEntry[];
  /** Nombre de relations dont un champ a été réécrit ou vidé par l'édition. */
  affectedRelations: number;
}

const DETACHED_NOTE = "Référence retirée de l'import : ce champ doit être réaffecté à un item existant.";

/** Un type d'entité correspond à un champ de relation homonyme, sauf `color` qui n'en a pas. */
function relationFieldKeyFor(entity: DiffReferentialEntityType): DiffRelationFieldKey | null {
  return entity in RELATION_FIELD_JSON_KEYS ? (entity as DiffRelationFieldKey) : null;
}

@Injectable({
  providedIn: 'root'
})
export class ImporterBatchEditService {
  /** Apparie les lignes du diff avec leurs opérations (même ordre) et les trie pour la revue. */
  buildEntries(rows: DiffRow[], operations: ImportOperation[]): DiffEntry[] {
    const operationByRowId = new Map<string, ImportOperation>();
    rows.forEach((row, index) => {
      const operation = operations[index];
      if (operation) operationByRowId.set(row.id, operation);
    });

    return sortDiffRows(rows)
      .map((row) => ({ row, operation: operationByRowId.get(row.id) }))
      .filter((entry): entry is DiffEntry => !!entry.operation);
  }

  /**
   * Retire une entrée du batch. Si c'est un ajout de collection, les relations qui le référençaient
   * voient leur champ vidé et repassent en « incertain » : l'import reste bloqué tant qu'elles ne sont pas réaffectées.
   */
  removeEntry(entries: DiffEntry[], rowId: string): DiffEntriesEdit {
    const target = entries.find((entry) => entry.row.id === rowId);
    if (!target) return { entries, affectedRelations: 0 };

    const remaining = entries.filter((entry) => entry.row.id !== rowId);
    if (target.row.entity === 'relation') {
      return { entries: remaining, affectedRelations: 0 };
    }

    return this.retargetReferences(remaining, target.row.sourceId, null);
  }

  /**
   * Remplace un ajout de collection par un item existant : l'ajout disparaît du batch et
   * toutes les relations qui pointaient sur l'id temporaire pointent désormais sur l'item choisi.
   */
  matchEntryToExisting(entries: DiffEntry[], rowId: string, targetId: string, targetLabel: string): DiffEntriesEdit {
    const target = entries.find((entry) => entry.row.id === rowId);
    if (!target) return { entries, affectedRelations: 0 };

    const remaining = entries.filter((entry) => entry.row.id !== rowId);
    return this.retargetReferences(remaining, target.row.sourceId, { id: targetId, label: targetLabel });
  }

  /**
   * Change le type d'un ajout de collection (ex: un « symbole » qui est en fait un accessoire).
   * Les relations qui le référençaient basculent sur le champ correspondant au nouveau type
   * (`symboleId` → `symboleAccessoryId`), ou voient leur champ vidé si le nouveau type n'entre pas
   * dans une relation (cas de `color`).
   */
  changeEntryType(entries: DiffEntry[], rowId: string, entity: DiffReferentialEntityType): DiffEntriesEdit {
    const target = entries.find((entry) => entry.row.id === rowId);
    if (!target || target.row.entity === 'relation' || target.row.entity === entity) {
      return { entries, affectedRelations: 0 };
    }

    // Le nouveau type peut exiger un champ que l'IA n'a pas extrait : on bloque l'import plutôt que
    // de laisser le serveur refuser l'opération au moment de l'application.
    const missingFields = REQUIRED_ADD_FIELDS[entity].filter(
      (field) => target.operation.fields?.[field] === undefined || target.operation.fields?.[field] === null
    );
    const incertain = target.row.incertain || missingFields.length > 0;
    const note = missingFields.length
      ? this.appendNote(
          target.row.note,
          `Type changé en « ${ENTITY_TYPE_LABELS[entity]} » : champ(s) obligatoire(s) manquant(s) — ${missingFields.join(', ')}.`
        )
      : target.row.note;

    const retyped: DiffEntry = {
      row: { ...target.row, entity, incertain, note },
      operation: {
        ...target.operation,
        entity: entity as ImportEntityType,
        incertain,
        ...(note ? { note } : {})
      }
    };

    const others = entries.filter((entry) => entry.row.id !== rowId);
    const fieldKey = relationFieldKeyFor(entity);
    const moved = this.moveReferences(
      others,
      target.row.sourceId,
      fieldKey ? { key: fieldKey, entityType: entity, label: target.row.label } : null
    );

    // L'entrée re-typée reprend sa place d'origine dans la liste.
    const nextEntries = entries.map((entry) =>
      entry.row.id === rowId ? retyped : moved.entries.find((candidate) => candidate.row.id === entry.row.id) ?? entry
    );

    return { entries: nextEntries, affectedRelations: moved.affectedRelations };
  }

  /**
   * Déplace les références à `sourceId` vers un autre champ de relation (`target`),
   * ou les vide si le nouveau type n'a pas de champ de relation.
   */
  private moveReferences(
    entries: DiffEntry[],
    sourceId: string,
    target: { key: DiffRelationFieldKey; entityType: DiffReferentialEntityType; label: string } | null
  ): DiffEntriesEdit {
    if (!target) return this.retargetReferences(entries, sourceId, null);

    let affectedRelations = 0;

    const nextEntries = entries.map((entry) => {
      const relationFields = entry.row.relationFields;
      if (entry.row.entity !== 'relation' || !relationFields?.length) return entry;

      const sourceFields = relationFields.filter((field) => field.id === sourceId);
      if (!sourceFields.length) return entry;
      if (sourceFields.every((field) => field.key === target.key)) return entry;

      affectedRelations += 1;

      // Le champ d'arrivée était déjà occupé par autre chose : on écrase, mais on le signale.
      const occupied = relationFields.find((field) => field.key === target.key && field.id && field.id !== sourceId);

      const nextFields: DiffRelationField[] = relationFields
        .filter((field) => !(field.key === target.key && field.id !== sourceId))
        .map((field) =>
          field.id === sourceId
            ? { key: target.key, entityType: target.entityType, id: sourceId, label: target.label }
            : field
        );

      const nextOperationFields = { ...entry.operation.fields };
      for (const field of sourceFields) {
        nextOperationFields[RELATION_FIELD_JSON_KEYS[field.key]] = null;
      }
      nextOperationFields[RELATION_FIELD_JSON_KEYS[target.key]] = sourceId;

      const incertain = entry.row.incertain || !!occupied;
      const note = occupied
        ? this.appendNote(
            entry.row.note,
            `Le champ « ${target.key} » contenait déjà « ${occupied.label || occupied.id} » et a été écrasé : à vérifier.`
          )
        : entry.row.note;

      const row: DiffRow = { ...entry.row, relationFields: nextFields, incertain, note };
      const operation: ImportOperation = {
        ...entry.operation,
        fields: nextOperationFields,
        incertain,
        ...(note ? { note } : {})
      };

      return { row, operation };
    });

    return { entries: nextEntries, affectedRelations };
  }

  /** Réécrit (ou vide, si `replacement` est null) toutes les références des relations vers `sourceId`. */
  private retargetReferences(
    entries: DiffEntry[],
    sourceId: string,
    replacement: { id: string; label: string } | null
  ): DiffEntriesEdit {
    let affectedRelations = 0;

    const nextEntries = entries.map((entry) => {
      const relationFields = entry.row.relationFields;
      if (entry.row.entity !== 'relation' || !relationFields?.length) return entry;
      if (!relationFields.some((field) => field.id === sourceId)) return entry;

      affectedRelations += 1;

      const nextFields: DiffRelationField[] = relationFields.map((field) =>
        field.id === sourceId
          ? { ...field, id: replacement?.id ?? null, label: replacement?.label ?? '' }
          : field
      );

      const changedKeys = relationFields.filter((field) => field.id === sourceId).map((field) => field.key);
      const nextOperationFields = { ...entry.operation.fields };
      for (const key of changedKeys) {
        nextOperationFields[RELATION_FIELD_JSON_KEYS[key]] = replacement?.id ?? null;
      }

      // Vider un champ laisse la relation incomplète : on la repasse en incertain pour bloquer l'import.
      const incertain = replacement ? entry.row.incertain : true;
      const note = replacement ? entry.row.note : this.appendNote(entry.row.note, DETACHED_NOTE);

      const row: DiffRow = { ...entry.row, relationFields: nextFields, incertain, note };
      const operation: ImportOperation = {
        ...entry.operation,
        fields: nextOperationFields,
        incertain,
        ...(note ? { note } : {})
      };

      return { row, operation };
    });

    return { entries: nextEntries, affectedRelations };
  }

  private appendNote(existingNote: string | undefined, added: string): string {
    return existingNote ? `${existingNote} — ${added}` : added;
  }
}
