import { TestBed } from '@angular/core/testing';
import { IBaseColor } from '../../../../../models/data/base-data-models';
import { ImportBatchValidatorService } from './import-batch-validator.service';
import { EntityCollections, ImporterReviewBuilderService } from './importer-review-builder.service';

const existingColor: IBaseColor = { id: 'color-1', name: 'Bleu marine', colorData: '#1B3A6B' };

describe('ImportBatchValidatorService', () => {
  let service: ImportBatchValidatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImportBatchValidatorService);
  });

  it('rejects text that is not valid JSON', () => {
    const result = service.parse('{ not json');
    expect(result.batch).toBeNull();
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('rejects an empty input', () => {
    const result = service.parse('   ');
    expect(result.batch).toBeNull();
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('rejects JSON that does not match the import schema', () => {
    const result = service.parse(JSON.stringify({ operations: [{ op: 'invalid-op' }] }));
    expect(result.batch).toBeNull();
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('accepts a valid batch', () => {
    const result = service.parse(
      JSON.stringify({
        operations: [
          {
            op: 'add',
            entity: 'symbole',
            id: 'tmp:symbole-1',
            fields: { name: 'Croix de guerre' },
            confidence: 0.95,
            incertain: false
          }
        ]
      })
    );
    expect(result.errors).toEqual([]);
    expect(result.batch?.operations.length).toBe(1);
  });
});

describe('ImporterReviewBuilderService', () => {
  let service: ImporterReviewBuilderService;

  const emptyCollections: EntityCollections = {
    circulaire: [],
    color: [existingColor],
    filiere: [{ id: 'filiere-1', name: 'Aviation' }],
    placement: [],
    position: [],
    symbole: [],
    signification: [],
    symboleSens: [],
    symboleAccessoire: []
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImporterReviewBuilderService);
  });

  it('builds a referential row using fields.name, with confidence scaled to 0-100', () => {
    const { rows } = service.buildReview(
      {
        operations: [
          { op: 'add', entity: 'symbole', id: 'tmp:symbole-1', fields: { name: 'Croix de guerre' }, confidence: 0.95, incertain: false }
        ]
      },
      emptyCollections
    );

    expect(rows).toHaveLength(1);
    expect(rows[0].label).toBe('Croix de guerre');
    expect(rows[0].entity).toBe('symbole');
    expect(rows[0].confidence).toBe(95);
    expect(rows[0].incertain).toBe(false);
  });

  it('resolves a relation field pointing to an existing referential entity', () => {
    const { rows } = service.buildReview(
      {
        operations: [
          {
            op: 'add',
            entity: 'relation',
            id: 'tmp:relation-1',
            fields: { filiereId: 'filiere-1' },
            confidence: 0.9,
            incertain: false
          }
        ]
      },
      emptyCollections
    );

    expect(rows[0].relationFields).toEqual([{ key: 'filiere', entityType: 'filiere', id: 'filiere-1', label: 'Aviation' }]);
  });

  it('resolves a relation field pointing to a tmp: id created earlier in the same batch', () => {
    const { rows, referentialOptions } = service.buildReview(
      {
        operations: [
          { op: 'add', entity: 'symbole', id: 'tmp:symbole-1', fields: { name: 'Croix de guerre' }, confidence: 0.95, incertain: false },
          {
            op: 'add',
            entity: 'relation',
            id: 'tmp:relation-1',
            fields: { symboleId: 'tmp:symbole-1' },
            confidence: 0.9,
            incertain: false
          }
        ]
      },
      emptyCollections
    );

    const relationRow = rows.find((r) => r.entity === 'relation');
    expect(relationRow?.relationFields?.[0]).toEqual({ key: 'symbole', entityType: 'symbole', id: 'tmp:symbole-1', label: 'Croix de guerre' });
    expect(relationRow?.label).toBe('Croix de guerre');
    expect(referentialOptions.symbole).toContainEqual({ id: 'tmp:symbole-1', name: 'Croix de guerre' });
  });

  it('marks an unresolved relation field id with an empty label instead of throwing', () => {
    const { rows } = service.buildReview(
      {
        operations: [
          { op: 'add', entity: 'relation', id: 'tmp:relation-1', fields: { filiereId: 'unknown-id' }, confidence: 0.4, incertain: true, note: 'à vérifier' }
        ]
      },
      emptyCollections
    );

    expect(rows[0].relationFields?.[0]).toEqual({ key: 'filiere', entityType: 'filiere', id: 'unknown-id', label: '' });
    expect(rows[0].incertain).toBe(true);
    expect(rows[0].note).toBe('à vérifier');
  });

  it('includes colorData in referential options for existing and batch-local colors', () => {
    const { referentialOptions } = service.buildReview(
      {
        operations: [
          { op: 'add', entity: 'color', id: 'tmp:color-1', fields: { name: 'Bleu roy', colorData: '#4169E1' }, confidence: 0.85, incertain: false }
        ]
      },
      emptyCollections
    );

    expect(referentialOptions.color).toContainEqual(existingColor);
    expect(referentialOptions.color).toContainEqual({ id: 'tmp:color-1', name: 'Bleu roy', colorData: '#4169E1' });
  });

  it('falls back to the existing name for an update/remove without fields.name', () => {
    const { rows } = service.buildReview(
      { operations: [{ op: 'remove', entity: 'filiere', id: 'filiere-1', confidence: 1, incertain: false }] },
      emptyCollections
    );

    expect(rows[0].label).toBe('Aviation');
  });
});
