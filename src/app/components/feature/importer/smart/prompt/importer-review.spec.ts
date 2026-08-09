import { TestBed } from '@angular/core/testing';
import { IBaseColor, IBaseSignification } from '../../../../../models/data/base-data-models';
import { ImportBatchValidatorService } from './import-batch-validator.service';
import { EntityCollections, ImporterReviewBuilderService } from './importer-review-builder.service';

const existingColor: IBaseColor = { id: 'color-1', name: 'Bleu marine', colorData: '#1B3A6B' };
const existingSignification: IBaseSignification = { id: 'signification-1', content: 'Bravoure au combat' };

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
    signification: [existingSignification],
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

    // Tous les champs de relation sont présents (pas seulement ceux extraits par l'IA), pour rester éditables.
    expect(rows[0].relationFields).toHaveLength(8);
    expect(rows[0].relationFields).toContainEqual({ key: 'filiere', entityType: 'filiere', id: 'filiere-1', label: 'Aviation' });
    expect(rows[0].relationFields).toContainEqual({ key: 'symbole', entityType: 'symbole', id: null, label: '' });
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
    expect(relationRow?.relationFields?.find((f) => f.key === 'symbole')).toEqual({
      key: 'symbole',
      entityType: 'symbole',
      id: 'tmp:symbole-1',
      label: 'Croix de guerre'
    });
    expect(relationRow?.label).toBe('Croix de guerre');
    expect(referentialOptions.symbole).toContainEqual({ id: 'tmp:symbole-1', name: 'Croix de guerre' });
  });

  it('always exposes every relation field type, even those the AI did not extract, as an empty (addable) slot', () => {
    const { rows } = service.buildReview(
      {
        operations: [
          { op: 'add', entity: 'relation', id: 'tmp:relation-1', fields: { filiereId: 'filiere-1' }, confidence: 0.9, incertain: false }
        ]
      },
      emptyCollections
    );

    const keys = rows[0].relationFields?.map((f) => f.key).sort();
    expect(keys).toEqual(
      ['circulaire', 'filiere', 'placement', 'position', 'signification', 'symbole', 'symboleAccessoire', 'symboleSens'].sort()
    );
    expect(rows[0].relationFields?.filter((f) => f.id === null)).toHaveLength(7);
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

    expect(rows[0].relationFields?.find((f) => f.key === 'filiere')).toEqual({
      key: 'filiere',
      entityType: 'filiere',
      id: 'unknown-id',
      label: ''
    });
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

  it('uses fields.content (not fields.name) as the label of a signification add', () => {
    const { rows } = service.buildReview(
      {
        operations: [
          {
            op: 'add',
            entity: 'signification',
            id: 'tmp:signification-81',
            fields: { content: 'Bravoure au combat' },
            confidence: 0.9,
            incertain: false
          }
        ]
      },
      emptyCollections
    );

    expect(rows[0].label).toBe('Bravoure au combat');
    // `content` porte le libellé : il ne doit pas réapparaître comme attribut brut.
    expect(rows[0].attributes).toBeUndefined();
  });

  it('resolves an existing signification\'s content when referenced by a relation', () => {
    const { rows } = service.buildReview(
      {
        operations: [
          { op: 'add', entity: 'relation', id: 'tmp:relation-1', fields: { significationId: 'signification-1' }, confidence: 0.9, incertain: false }
        ]
      },
      emptyCollections
    );

    expect(rows[0].relationFields).toContainEqual({
      key: 'signification',
      entityType: 'signification',
      id: 'signification-1',
      label: 'Bravoure au combat'
    });
  });

  it('resolves a batch-local signification\'s content when referenced by a relation, instead of its tmp id', () => {
    const { rows } = service.buildReview(
      {
        operations: [
          {
            op: 'add',
            entity: 'signification',
            id: 'tmp:signification-81',
            fields: { content: 'Décoré pour acte de bravoure' },
            confidence: 0.9,
            incertain: false
          },
          {
            op: 'add',
            entity: 'relation',
            id: 'tmp:relation-1',
            fields: { significationId: 'tmp:signification-81' },
            confidence: 0.9,
            incertain: false
          }
        ]
      },
      emptyCollections
    );

    const relationRow = rows.find((r) => r.entity === 'relation');
    const significationField = relationRow?.relationFields?.find((f) => f.key === 'signification');
    expect(significationField?.label).toBe('Décoré pour acte de bravoure');
    expect(significationField?.label).not.toContain('tmp:');
  });

  it('lists existing significations as referential options despite the absence of `name`', () => {
    const { referentialOptions } = service.buildReview({ operations: [] }, emptyCollections);

    expect(referentialOptions.signification).toContainEqual({ id: 'signification-1', name: 'Bravoure au combat' });
  });

  it('still lists a nameless existing item as a referential option, labeled "Non défini"', () => {
    const collections: EntityCollections = { ...emptyCollections, placement: [{ id: 'placement-1' }] };
    const { referentialOptions } = service.buildReview({ operations: [] }, collections);

    expect(referentialOptions.placement).toContainEqual({ id: 'placement-1', name: 'Non défini' });
  });

  it('labels a nameless batch add "Non défini" instead of leaking its tmp id, in both the row and any relation referencing it', () => {
    const { rows } = service.buildReview(
      {
        operations: [
          { op: 'add', entity: 'circulaire', id: 'tmp:circulaire-3', fields: { matiere: 'Papier' }, confidence: 0.4, incertain: true },
          {
            op: 'add',
            entity: 'relation',
            id: 'tmp:relation-1',
            fields: { circulaireId: 'tmp:circulaire-3' },
            confidence: 0.4,
            incertain: true
          }
        ]
      },
      emptyCollections
    );

    const circulaireRow = rows.find((r) => r.entity === 'circulaire');
    const relationRow = rows.find((r) => r.entity === 'relation');
    const circulaireField = relationRow?.relationFields?.find((f) => f.key === 'circulaire');

    expect(circulaireRow?.label).toBe('Non défini');
    expect(circulaireField?.label).toBe('Non défini');
    expect(circulaireField?.label).not.toContain('tmp:');
  });

  it('falls back to the existing name for an update/remove without fields.name', () => {
    const { rows } = service.buildReview(
      { operations: [{ op: 'remove', entity: 'filiere', id: 'filiere-1', confidence: 1, incertain: false }] },
      emptyCollections
    );

    expect(rows[0].label).toBe('Aviation');
  });
});
