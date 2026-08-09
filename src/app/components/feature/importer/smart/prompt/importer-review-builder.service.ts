import { Injectable } from '@angular/core';
import { IBaseCollectionData, IBaseColor } from '../../../../../models/data/base-data-models';
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
        if (item.name) map.set(item.id, item.name);
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
      const name = (op.fields?.['name'] as string | undefined) || op.id;
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
      const relationFields: DiffRelationField[] = RELATION_FIELD_DEFS.filter((def) =>
        op.fields ? Object.prototype.hasOwnProperty.call(op.fields, def.jsonKey) : false
      ).map((def) => {
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
    const fieldsName = op.fields?.['name'] as string | undefined;
    const label = fieldsName ?? existingName ?? op.id;

    const attributes: DiffAttribute[] = Object.entries(op.fields ?? {})
      .filter(([key]) => key !== 'name')
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

      const storeOptions: DiffOption[] = collections[entityType]
        .filter((item): item is IBaseCollectionData & { name: string } => !!item.name)
        .map((item) => ({ id: item.id, name: item.name, ...(isColor ? { colorData: (item as IBaseColor).colorData } : {}) }));

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
