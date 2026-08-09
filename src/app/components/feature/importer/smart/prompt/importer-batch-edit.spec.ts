import { TestBed } from '@angular/core/testing';
import { ImporterBatchEditService } from './importer-batch-edit.service';
import { EntityCollections, ImporterReviewBuilderService, sortDiffRows } from './importer-review-builder.service';
import { DiffRow } from '../../models/diff-row.model';
import { ImportBatch } from './import-batch.model';

const collections: EntityCollections = {
  circulaire: [],
  color: [],
  filiere: [{ id: 'filiere-1', name: 'Aviation' }],
  placement: [],
  position: [],
  symbole: [{ id: 'symbole-existant', name: 'Croix de guerre' }],
  signification: [],
  symboleSens: [],
  symboleAccessoire: []
};

/** Un ajout de symbole (tmp:) référencé par deux relations, plus une relation indépendante. */
const batch: ImportBatch = {
  operations: [
    {
      op: 'add',
      entity: 'relation',
      id: 'tmp:relation-1',
      fields: { symboleId: 'tmp:symbole-1', filiereId: 'filiere-1' },
      confidence: 0.9,
      incertain: false
    },
    { op: 'add', entity: 'symbole', id: 'tmp:symbole-1', fields: { name: 'Croix de guerre 39-45' }, confidence: 0.5, incertain: false },
    {
      op: 'add',
      entity: 'relation',
      id: 'tmp:relation-2',
      fields: { symboleId: 'tmp:symbole-1' },
      confidence: 0.8,
      incertain: true,
      note: 'doute initial'
    },
    { op: 'add', entity: 'filiere', id: 'tmp:filiere-9', fields: { name: 'Marine' }, confidence: 0.95, incertain: false }
  ]
};

function row(partial: Partial<DiffRow>): DiffRow {
  return { id: 'r', sourceId: 's', op: 'add', entity: 'symbole', label: '', confidence: 100, incertain: false, ...partial };
}

describe('sortDiffRows', () => {
  it('met les ajouts de collection avant le reste', () => {
    const sorted = sortDiffRows([
      row({ id: 'relation', entity: 'relation', confidence: 10 }),
      row({ id: 'add-collection', entity: 'symbole', confidence: 90 })
    ]);

    expect(sorted.map((r) => r.id)).toEqual(['add-collection', 'relation']);
  });

  it('classe du moins certain au plus certain dans chaque groupe', () => {
    const sorted = sortDiffRows([
      row({ id: 'sur', confidence: 95 }),
      row({ id: 'incertain', confidence: 99, incertain: true }),
      row({ id: 'moyen', confidence: 40 })
    ]);

    expect(sorted.map((r) => r.id)).toEqual(['incertain', 'moyen', 'sur']);
  });

  it("ne classe pas une op de collection non-add avec les ajouts", () => {
    const sorted = sortDiffRows([
      row({ id: 'remove-collection', op: 'remove', confidence: 10 }),
      row({ id: 'add-collection', op: 'add', confidence: 90 })
    ]);

    expect(sorted.map((r) => r.id)).toEqual(['add-collection', 'remove-collection']);
  });
});

describe('ImporterBatchEditService', () => {
  let service: ImporterBatchEditService;
  let reviewBuilder: ImporterReviewBuilderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImporterBatchEditService);
    reviewBuilder = TestBed.inject(ImporterReviewBuilderService);
  });

  function buildEntries() {
    const { rows } = reviewBuilder.buildReview(batch, collections);
    return service.buildEntries(rows, batch.operations);
  }

  it('apparie chaque ligne avec son opération malgré le tri', () => {
    const entries = buildEntries();

    expect(entries).toHaveLength(4);
    for (const entry of entries) {
      expect(entry.operation.id).toBe(entry.row.sourceId);
    }
    // Ajouts de collection d'abord, du moins certain au plus certain.
    expect(entries.map((e) => e.row.sourceId)).toEqual(['tmp:symbole-1', 'tmp:filiere-9', 'tmp:relation-2', 'tmp:relation-1']);
  });

  it('supprime une relation sans toucher aux autres entrées', () => {
    const entries = buildEntries();
    const relationRowId = entries.find((e) => e.row.sourceId === 'tmp:relation-1')!.row.id;

    const result = service.removeEntry(entries, relationRowId);

    expect(result.affectedRelations).toBe(0);
    expect(result.entries).toHaveLength(3);
    expect(result.entries.some((e) => e.row.sourceId === 'tmp:relation-1')).toBe(false);
  });

  it('vide le champ des relations et les repasse en incertain quand un ajout de collection est supprimé', () => {
    const entries = buildEntries();
    const symboleRowId = entries.find((e) => e.row.sourceId === 'tmp:symbole-1')!.row.id;

    const result = service.removeEntry(entries, symboleRowId);

    expect(result.affectedRelations).toBe(2);
    expect(result.entries.some((e) => e.row.sourceId === 'tmp:symbole-1')).toBe(false);

    const relation1 = result.entries.find((e) => e.row.sourceId === 'tmp:relation-1')!;
    expect(relation1.row.relationFields).toContainEqual({ key: 'symbole', entityType: 'symbole', id: null, label: '' });
    expect(relation1.operation.fields?.['symboleId']).toBeNull();
    expect(relation1.row.incertain).toBe(true);
    expect(relation1.operation.incertain).toBe(true);
    expect(relation1.row.note).toContain('réaffecté');

    // Le champ qui ne pointait pas sur l'entrée supprimée est intact.
    expect(relation1.row.relationFields).toContainEqual({ key: 'filiere', entityType: 'filiere', id: 'filiere-1', label: 'Aviation' });

    // La note d'origine de la relation est conservée.
    const relation2 = result.entries.find((e) => e.row.sourceId === 'tmp:relation-2')!;
    expect(relation2.row.note).toContain('doute initial');
  });

  it('ne touche pas aux relations qui ne référencent pas l\'entrée supprimée', () => {
    const entries = buildEntries();
    const filiereRowId = entries.find((e) => e.row.sourceId === 'tmp:filiere-9')!.row.id;

    const result = service.removeEntry(entries, filiereRowId);

    expect(result.affectedRelations).toBe(0);
    expect(result.entries.every((e) => !e.row.incertain || e.row.sourceId === 'tmp:relation-2')).toBe(true);
  });

  it('rattache un ajout à un item existant et réécrit les relations', () => {
    const entries = buildEntries();
    const symboleRowId = entries.find((e) => e.row.sourceId === 'tmp:symbole-1')!.row.id;

    const result = service.matchEntryToExisting(entries, symboleRowId, 'symbole-existant', 'Croix de guerre');

    expect(result.affectedRelations).toBe(2);
    // L'ajout disparaît : l'entité existe déjà, il ne faut pas la recréer.
    expect(result.entries.some((e) => e.row.sourceId === 'tmp:symbole-1')).toBe(false);

    const relation1 = result.entries.find((e) => e.row.sourceId === 'tmp:relation-1')!;
    expect(relation1.row.relationFields).toContainEqual({
      key: 'symbole',
      entityType: 'symbole',
      id: 'symbole-existant',
      label: 'Croix de guerre'
    });
    expect(relation1.operation.fields?.['symboleId']).toBe('symbole-existant');
    // Un rattachement lève le doute au lieu de l'introduire.
    expect(relation1.row.incertain).toBe(false);
  });

  it('change le type et bascule les relations sur le champ correspondant', () => {
    const entries = buildEntries();
    const symboleRowId = entries.find((e) => e.row.sourceId === 'tmp:symbole-1')!.row.id;

    const result = service.changeEntryType(entries, symboleRowId, 'symboleAccessoire');

    expect(result.affectedRelations).toBe(2);

    const retyped = result.entries.find((e) => e.row.sourceId === 'tmp:symbole-1')!;
    expect(retyped.row.entity).toBe('symboleAccessoire');
    expect(retyped.operation.entity).toBe('symboleAccessoire');
    // `name` suffit pour un accessoire : pas de doute introduit.
    expect(retyped.row.incertain).toBe(false);

    const relation1 = result.entries.find((e) => e.row.sourceId === 'tmp:relation-1')!;
    expect(relation1.operation.fields?.['symboleId']).toBeNull();
    expect(relation1.operation.fields?.['symboleAccessoryId']).toBe('tmp:symbole-1');
    expect(relation1.row.relationFields).toContainEqual({
      key: 'symboleAccessoire',
      entityType: 'symboleAccessoire',
      id: 'tmp:symbole-1',
      label: 'Croix de guerre 39-45'
    });
    expect(relation1.row.relationFields?.some((f) => f.key === 'symbole')).toBe(false);
  });

  it('signale les champs obligatoires manquants du nouveau type', () => {
    const entries = buildEntries();
    const symboleRowId = entries.find((e) => e.row.sourceId === 'tmp:symbole-1')!.row.id;

    // Une couleur exige `colorData`, que l'opération d'origine n'a pas.
    const result = service.changeEntryType(entries, symboleRowId, 'color');
    const retyped = result.entries.find((e) => e.row.sourceId === 'tmp:symbole-1')!;

    expect(retyped.row.incertain).toBe(true);
    expect(retyped.operation.incertain).toBe(true);
    expect(retyped.row.note).toContain('colorData');
  });

  it('vide les références quand le nouveau type n\'entre pas dans une relation', () => {
    const entries = buildEntries();
    const symboleRowId = entries.find((e) => e.row.sourceId === 'tmp:symbole-1')!.row.id;

    // `color` n'a pas de champ dans une relation : les références doivent être vidées.
    const result = service.changeEntryType(entries, symboleRowId, 'color');

    expect(result.affectedRelations).toBe(2);
    const relation1 = result.entries.find((e) => e.row.sourceId === 'tmp:relation-1')!;
    expect(relation1.operation.fields?.['symboleId']).toBeNull();
    expect(relation1.row.incertain).toBe(true);
    expect(relation1.row.note).toContain('réaffecté');
  });

  it('conserve la position de l\'entrée re-typée dans la liste', () => {
    const entries = buildEntries();
    const symboleRowId = entries.find((e) => e.row.sourceId === 'tmp:symbole-1')!.row.id;
    const positionAvant = entries.findIndex((e) => e.row.id === symboleRowId);

    const result = service.changeEntryType(entries, symboleRowId, 'symboleAccessoire');

    expect(result.entries).toHaveLength(entries.length);
    expect(result.entries.findIndex((e) => e.row.id === symboleRowId)).toBe(positionAvant);
  });

  it('ne fait rien si le type choisi est déjà celui de l\'entrée', () => {
    const entries = buildEntries();
    const symboleRowId = entries.find((e) => e.row.sourceId === 'tmp:symbole-1')!.row.id;

    const result = service.changeEntryType(entries, symboleRowId, 'symbole');

    expect(result.affectedRelations).toBe(0);
    expect(result.entries).toBe(entries);
  });

  it('laisse le batch appliquable sans l\'opération supprimée', () => {
    const entries = buildEntries();
    const filiereRowId = entries.find((e) => e.row.sourceId === 'tmp:filiere-9')!.row.id;

    const { entries: next } = service.removeEntry(entries, filiereRowId);

    expect(next.map((e) => e.operation.id)).not.toContain('tmp:filiere-9');
    expect(next.map((e) => e.operation.id)).toHaveLength(3);
  });
});
