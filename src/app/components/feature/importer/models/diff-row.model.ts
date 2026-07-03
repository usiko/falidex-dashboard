export type DiffOperation = 'add' | 'update' | 'remove';

export type DiffEntityType =
  | 'circulaire'
  | 'color'
  | 'filiere'
  | 'placement'
  | 'position'
  | 'symbole'
  | 'signification'
  | 'symboleSens'
  | 'symboleAccessoire'
  | 'relation';

export type DiffRelationFieldKey =
  | 'filiere'
  | 'symbole'
  | 'placement'
  | 'position'
  | 'circulaire'
  | 'signification'
  | 'symboleSens'
  | 'symboleAccessoire';

export interface DiffOption {
  id: string;
  name: string;
}

export interface DiffRelationField {
  key: DiffRelationFieldKey;
  entityType: DiffEntityType;
  id: string | null;
  label: string;
}

export interface DiffAttribute {
  key: string;
  value: string;
}

export interface DiffRow {
  id: string;
  op: DiffOperation;
  entity: DiffEntityType;
  label: string;
  confidence: number;
  incertain: boolean;
  note?: string;
  relationFields?: DiffRelationField[];
  attributes?: DiffAttribute[];
}

export interface DiffFieldCorrection {
  rowId: string;
  fieldKey: DiffRelationFieldKey;
  newId: string;
  newLabel: string;
}

export const ENTITY_TYPE_LABELS: Record<DiffEntityType, string> = {
  circulaire: 'Circulaire',
  color: 'Couleur',
  filiere: 'Filière',
  placement: 'Placement',
  position: 'Position',
  symbole: 'Symbole',
  signification: 'Signification',
  symboleSens: 'Symbole (sens)',
  symboleAccessoire: 'Symbole accessoire',
  relation: 'Relation'
};
