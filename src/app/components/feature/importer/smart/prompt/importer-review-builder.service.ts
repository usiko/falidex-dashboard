import { Injectable } from '@angular/core';
import { IBaseCollectionData } from '../../../../../models/data/base-data-models';
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

@Injectable({
  providedIn: 'root'
})
export class ImporterReviewBuilderService {
  buildReview(batch: ImportBatch, collections: EntityCollections): ImporterReviewResult {
    const storeNames = this.buildStoreNames(collections);
    const batchNames = this.buildBatchLocalNames(batch);

    const rows = batch.operations.map((op, index) => this.buildRow(op, index, storeNames, batchNames));
    const referentialOptions = this.buildReferentialOptions(collections, batchNames);

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
    batchNames: NameMapByEntity
  ): Partial<Record<DiffEntityType, DiffOption[]>> {
    const result: Partial<Record<DiffEntityType, DiffOption[]>> = {};
    for (const entityType of Object.keys(collections) as NonRelationEntityType[]) {
      const storeOptions: DiffOption[] = collections[entityType]
        .filter((item): item is IBaseCollectionData & { name: string } => !!item.name)
        .map((item) => ({ id: item.id, name: item.name }));

      const batchOptions: DiffOption[] = [...(batchNames[entityType]?.entries() ?? [])].map(([id, name]) => ({ id, name }));

      result[entityType] = [...storeOptions, ...batchOptions];
    }
    return result;
  }
}
