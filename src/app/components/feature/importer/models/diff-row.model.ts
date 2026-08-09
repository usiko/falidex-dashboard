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

/** Tous les types d'entité sauf la relation : ceux qui portent une collection du référentiel. */
export type DiffReferentialEntityType = Exclude<DiffEntityType, 'relation'>;

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
  /** Code couleur (hex ou rgba) : uniquement renseigné pour les options de type `color`, pour afficher un aperçu. */
  colorData?: string;
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
  /** Id porté par l'opération du batch (`tmp:...` pour un ajout, id de base sinon). */
  sourceId: string;
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

/** Un ajout de collection que l'utilisateur rattache à un item déjà existant au lieu d'en créer un nouveau. */
export interface DiffRowMatch {
  rowId: string;
  targetId: string;
  targetLabel: string;
}

/** Un ajout de collection dont l'utilisateur corrige le type (ex: un « symbole » qui est en fait un accessoire). */
export interface DiffRowTypeChange {
  rowId: string;
  entity: DiffReferentialEntityType;
}

/** Clé JSON (`fields.<clé>`) d'un champ de relation, telle qu'attendue par le schéma d'import. */
export const RELATION_FIELD_JSON_KEYS: Record<DiffRelationFieldKey, string> = {
  filiere: 'filiereId',
  symbole: 'symboleId',
  placement: 'placementId',
  position: 'positionId',
  circulaire: 'circulaireId',
  signification: 'significationId',
  symboleSens: 'symboleSensId',
  symboleAccessoire: 'symboleAccessoryId'
};

/**
 * Champs exigés par le serveur pour créer chaque type d'entité (`apply_referential_operation`).
 * Changer le type d'une entrée peut donc rendre obligatoire un champ que l'IA n'a pas extrait.
 */
export const REQUIRED_ADD_FIELDS: Record<DiffReferentialEntityType, string[]> = {
  circulaire: ['name', 'matiere'],
  color: ['name', 'colorData'],
  filiere: ['name'],
  placement: ['name'],
  position: ['name'],
  symbole: ['name'],
  signification: ['content'],
  symboleSens: ['name'],
  symboleAccessoire: ['name']
};

export const REFERENTIAL_ENTITY_TYPES = Object.keys(REQUIRED_ADD_FIELDS) as DiffReferentialEntityType[];

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
