export type ImportOperationType = 'add' | 'update' | 'remove';

export type ImportEntityType =
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

export interface ImportOperation {
  op: ImportOperationType;
  entity: ImportEntityType;
  id: string;
  fields?: Record<string, unknown>;
  confidence: number;
  incertain: boolean;
  note?: string;
}

export interface ImportBatch {
  operations: ImportOperation[];
}
