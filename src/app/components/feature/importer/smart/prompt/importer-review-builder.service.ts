import { Injectable } from '@angular/core';
import { IBaseCollectionData, IBaseColor, IBaseSignification } from '../../../../../models/data/base-data-models';
import {
  DiffAttribute,
  DiffEntityType,
  DiffOption,
  DiffRelationField,
  DiffRelationFieldKey,
  DiffRow,
  RELATION_FIELD_JSON_KEYS
} from '../../models/diff-row.model';
import { ImportBatch, ImportOperation } from './import-batch.model';

export type NonRelationEntityType = Exclude<DiffEntityType, 'relation'>;

export type EntityCollections = Record<NonRelationEntityType, IBaseCollectionData[]>;

export interface ImporterReviewResult {
  batch: ImportBatch;
  rows: DiffRow[];
  referentialOptions: Partial<Record<DiffEntityType, DiffOption[]>>;
}

interface RelationFieldDef {
  key: DiffRelationFieldKey;
  entityType: NonRelationEntityType;
  jsonKey: string;
}

const RELATION_FIELD_DEFS: RelationFieldDef[] = (
  Object.entries(RELATION_FIELD_JSON_KEYS) as [DiffRelationFieldKey, string][]
).map(([key, jsonKey]) => ({ key, entityType: key as NonRelationEntityType, jsonKey }));

type NameMap = Map<string, string>;
type NameMapByEntity = Partial<Record<NonRelationEntityType, NameMap>>;

/**
 * Champ qui sert de libellé pour chaque type d'entité. La signification n'a pas de `name`
 * (voir `IBaseSignification`, `SignificationFields` côté serveur) : c'est `content` qui joue ce rôle,
 * sans quoi son libellé retombe sur l'id (`tmp:signification-1`) partout où elle est référencée.
 */
const DISPLAY_FIELD_KEY: Record<NonRelationEntityType, string> = {
  circulaire: 'name',
  color: 'name',
  filiere: 'name',
  placement: 'name',
  position: 'name',
  symbole: 'name',
  signification: 'content',
  symboleSens: 'name',
  symboleAccessoire: 'name'
};

/** Libellé porté par l'objet du référentiel déjà en base (`item.name`, sauf pour `signification`). */
function itemDisplayName(entityType: NonRelationEntityType, item: IBaseCollectionData): string | undefined {
  if (entityType === 'signification') return (item as IBaseSignification).content || undefined;
  return item.name;
}

/** Libellé porté par les `fields` d'une opération du batch (`fields.name`, sauf pour `signification`). */
function fieldsDisplayName(entityType: NonRelationEntityType, fields: Record<string, unknown> | undefined): string | undefined {
  return fields?.[DISPLAY_FIELD_KEY[entityType]] as string | undefined;
}

/**
 * Libellé de repli pour un item du référentiel (existant ou du batch) sans nom exploitable.
 * On l'affiche quand même (au lieu de l'exclure ou de retomber sur son id `tmp:...`) : il reste
 * sélectionnable pour une relation, mais sans id technique visible dans l'UI.
 */
const UNDEFINED_LABEL = 'Non défini';

/** Un ajout de collection est à traiter en premier : c'est lui qui conditionne les ids référencés par les relations. */
export function isCollectionAdd(row: DiffRow): boolean {
  return row.op === 'add' && row.entity !== 'relation';
}

/**
 * Ordre de revue : les ajouts de collection d'abord, puis le reste ; dans chaque groupe,
 * du moins certain au plus certain (`incertain` d'abord, puis confiance croissante).
 */
export function sortDiffRows(rows: DiffRow[]): DiffRow[] {
  return [...rows].sort((a, b) => {
    const groupDelta = (isCollectionAdd(a) ? 0 : 1) - (isCollectionAdd(b) ? 0 : 1);
    if (groupDelta !== 0) return groupDelta;

    const incertainDelta = (a.incertain ? 0 : 1) - (b.incertain ? 0 : 1);
    if (incertainDelta !== 0) return incertainDelta;

    if (a.confidence !== b.confidence) return a.confidence - b.confidence;
    return a.label.localeCompare(b.label);
  });
}

@Injectable({
  providedIn: 'root'
})
export class ImporterReviewBuilderService {
  buildReview(batch: ImportBatch, collections: EntityCollections): ImporterReviewResult {
    const storeNames = this.buildStoreNames(collections);
    const batchNames = this.buildBatchLocalNames(batch);
    const batchColorData = this.buildBatchLocalColorData(batch);

    const rows = batch.operations.map((op, index) => this.buildRow(op, index, storeNames, batchNames));
    const referentialOptions = this.buildReferentialOptions(collections, batchNames, batchColorData);

    return { batch, rows, referentialOptions };
  }

  private buildStoreNames(collections: EntityCollections): NameMapByEntity {
    const result: NameMapByEntity = {};
    for (const entityType of Object.keys(collections) as NonRelationEntityType[]) {
      const map: NameMap = new Map();
      for (const item of collections[entityType]) {
        const name = itemDisplayName(entityType, item);
        if (name) map.set(item.id, name);
      }
      result[entityType] = map;
    }
    return result;
  }

  private buildBatchLocalNames(batch: ImportBatch): NameMapByEntity {
    const result: NameMapByEntity = {};
    for (const op of batch.operations) {
      if (op.op !== 'add' || op.entity === 'relation') continue;
      const entityType = op.entity as NonRelationEntityType;
      const name = fieldsDisplayName(entityType, op.fields) ?? UNDEFINED_LABEL;
      if (!result[entityType]) result[entityType] = new Map();
      result[entityType]!.set(op.id, name);
    }
    return result;
  }

  /** Code couleur (`colorData`) des ajouts de couleur du batch, pour l'aperçu dans le picker de rattachement. */
  private buildBatchLocalColorData(batch: ImportBatch): NameMap {
    const result: NameMap = new Map();
    for (const op of batch.operations) {
      if (op.op !== 'add' || op.entity !== 'color') continue;
      const colorData = op.fields?.['colorData'] as string | undefined;
      if (colorData) result.set(op.id, colorData);
    }
    return result;
  }

  private resolveName(
    entityType: NonRelationEntityType,
    id: string | null | undefined,
    storeNames: NameMapByEntity,
    batchNames: NameMapByEntity
  ): string | undefined {
    if (!id) return undefined;
    return batchNames[entityType]?.get(id) ?? storeNames[entityType]?.get(id);
  }

  private buildRow(op: ImportOperation, index: number, storeNames: NameMapByEntity, batchNames: NameMapByEntity): DiffRow {
    const rowId = `${index}:${op.entity}:${op.id}`;
    const confidence = Math.round(Math.min(1, Math.max(0, op.confidence)) * 100);

    if (op.entity === 'relation') {
      // Tous les champs de relation possibles sont affichés (pas seulement ceux extraits par l'IA) :
      // chacun reste éditable pour ajouter une liaison manquante, avec « Non défini » si absente.
      const relationFields: DiffRelationField[] = RELATION_FIELD_DEFS.map((def) => {
        const fieldId = (op.fields?.[def.jsonKey] as string | null) ?? null;
        return {
          key: def.key,
          entityType: def.entityType,
          id: fieldId,
          label: this.resolveName(def.entityType, fieldId, storeNames, batchNames) ?? ''
        };
      });

      const label =
        relationFields.find((f) => f.key === 'symbole' && f.label)?.label ??
        relationFields.find((f) => f.key === 'filiere' && f.label)?.label ??
        'Relation';

      return {
        id: rowId,
        sourceId: op.id,
        op: op.op,
        entity: 'relation',
        label,
        confidence,
        incertain: op.incertain,
        note: op.note,
        relationFields
      };
    }

    const entityType = op.entity as NonRelationEntityType;
    const existingName = this.resolveName(entityType, op.id, storeNames, batchNames);
    const fieldsName = fieldsDisplayName(entityType, op.fields);
    const label = fieldsName ?? existingName ?? op.id;

    const displayFieldKey = DISPLAY_FIELD_KEY[entityType];
    const attributes: DiffAttribute[] = Object.entries(op.fields ?? {})
      .filter(([key]) => key !== displayFieldKey)
      .map(([key, value]) => ({ key, value: this.stringifyAttributeValue(value) }));

    return {
      id: rowId,
      sourceId: op.id,
      op: op.op,
      entity: op.entity,
      label,
      confidence,
      incertain: op.incertain,
      note: op.note,
      attributes: attributes.length ? attributes : undefined
    };
  }

  private stringifyAttributeValue(value: unknown): string {
    if (typeof value === 'string') return value;
    if (value === null || value === undefined) return '';
    return JSON.stringify(value);
  }

  private buildReferentialOptions(
    collections: EntityCollections,
    batchNames: NameMapByEntity,
    batchColorData: NameMap
  ): Partial<Record<DiffEntityType, DiffOption[]>> {
    const result: Partial<Record<DiffEntityType, DiffOption[]>> = {};
    for (const entityType of Object.keys(collections) as NonRelationEntityType[]) {
      const isColor = entityType === 'color';

      const storeOptions: DiffOption[] = collections[entityType].map((item) => ({
        id: item.id,
        name: itemDisplayName(entityType, item) ?? UNDEFINED_LABEL,
        ...(isColor ? { colorData: (item as IBaseColor).colorData } : {})
      }));

      const batchOptions: DiffOption[] = [...(batchNames[entityType]?.entries() ?? [])].map(([id, name]) => ({
        id,
        name,
        ...(isColor ? { colorData: batchColorData.get(id) } : {})
      }));

      result[entityType] = [...storeOptions, ...batchOptions];
    }
    return result;
  }
}
