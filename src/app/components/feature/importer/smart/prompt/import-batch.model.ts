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

export interface ImportNewLinkFields {
  name: string;
  annee?: number;
}

/** Corps de `POST /collection/import` : le batch validé, accompagné du contexte cible. */
export interface ImportApplyRequest {
  name: string;
  linkId?: string;
  newLink?: ImportNewLinkFields;
  operations: ImportOperation[];
}

export interface ImportOperationResult {
  op: ImportOperationType;
  entity: ImportEntityType;
  sourceId: string;
  resolvedId: string;
  before?: unknown;
  after?: unknown;
}

export interface ImportCode {
  _id: string;
  name: string;
  date: string;
  userId: string;
  userName: string;
  linkId?: string;
  status: 'applied' | 'failed';
  operations: ImportOperationResult[];
  error?: string;
}
