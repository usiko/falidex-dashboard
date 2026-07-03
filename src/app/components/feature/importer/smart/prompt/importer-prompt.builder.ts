import { IRelationData, IRelationItem } from '../../../../../models/data/base-relations.models';
import { IBaseCollectionData } from '../../../../../models/data/base-data-models';

export interface ReferentialLists {
  colors: IBaseCollectionData[];
  filieres: IBaseCollectionData[];
  symbols: IBaseCollectionData[];
  placements: IBaseCollectionData[];
  positions: IBaseCollectionData[];
  significations: IBaseCollectionData[];
}

export interface RelationLookups {
  filiereMap: Record<string, IBaseCollectionData>;
  symboleMap: Record<string, IBaseCollectionData>;
  placementMap: Record<string, IBaseCollectionData>;
  positionMap: Record<string, IBaseCollectionData>;
  circulaireMap: Record<string, IBaseCollectionData>;
  significationMap: Record<string, IBaseCollectionData>;
  symboleSensMap: Record<string, IBaseCollectionData>;
  symboleAccessoryMap: Record<string, IBaseCollectionData>;
}

const JSON_SCHEMA_BLOCK = `{
  "operations": [
    {
      "op": "add" | "update" | "remove",
      "entity": "circulaire" | "color" | "filiere" | "placement" | "position" | "symbole" | "signification" | "symboleSens" | "symboleAccessoire" | "relation",
      "id": "id réel si l'entité existe déjà (voir référentiels ci-dessous), sinon un id temporaire préfixé \\"tmp:\\" (ex: \\"tmp:symbole-1\\") réutilisable par d'autres opérations du même JSON",
      "fields": { "...": "champs de l'entité concernée ; pour un update, uniquement les champs qui changent" },
      "confidence": "nombre entre 0 et 1",
      "incertain": "true si l'information est ambiguë, absente du PDF ou à vérifier manuellement, false sinon"
    }
  ]
}`;

const EXTRACTION_RULES = `Consignes d'extraction :
- Analyse uniquement le PDF fourni pour extraire les informations (filière, symbole, position, placement, signification, couleur, circulaire, notes...).
- N'invente jamais une valeur absente ou illisible dans le PDF : marque plutôt l'opération avec "incertain": true, une "confidence" basse, et une note expliquant le doute.
- En cas de tableau ambigu ou de regroupement implicite (ex. rattachement matière/couleur/filière peu clair), ne choisis pas arbitrairement : marque "incertain": true.
- Pour toute entité qui n'existe pas déjà dans les référentiels listés ci-dessous, crée-la avec un id temporaire préfixé "tmp:" (ex. "tmp:symbole-1"). Cet id peut être référencé par une autre opération du même JSON (ex. une relation qui pointe vers un symbole pas encore créé).
- Avant de créer une nouvelle entité, rapproche le libellé extrait des référentiels existants ci-dessous par leur nom (insensible à la casse et aux accents) pour éviter les doublons.
- Réponds uniquement avec le JSON, sans texte ni balises markdown autour.`;

function formatNamesList(label: string, items: IBaseCollectionData[]): string {
  const names = items.map((i) => i.name).filter((n): n is string => !!n);
  return `${label} (${names.length}) : ${names.length ? names.join(', ') : 'aucun'}`;
}

export function buildReferentialsBlock(refs: ReferentialLists): string {
  return [
    formatNamesList('Couleurs existantes', refs.colors),
    formatNamesList('Filières existantes', refs.filieres),
    formatNamesList('Symboles existants', refs.symbols),
    formatNamesList('Placements existants', refs.placements),
    formatNamesList('Positions existantes', refs.positions),
    formatNamesList('Significations existantes', refs.significations)
  ].join('\n');
}

function resolveName(id: string | undefined, map: Record<string, IBaseCollectionData>): string | undefined {
  return id ? map[id]?.name : undefined;
}

export function buildSelectedCodeBlock(code: IRelationData, lookups: RelationLookups): string {
  const simplified = code.relations.map((item: IRelationItem) => {
    const entry: Record<string, unknown> = { id: item.id };
    const filiere = resolveName(item.filiereId, lookups.filiereMap);
    const symbole = resolveName(item.symboleId, lookups.symboleMap);
    const placement = resolveName(item.placementId, lookups.placementMap);
    const position = resolveName(item.positionId, lookups.positionMap);
    const circulaire = resolveName(item.circulaireId, lookups.circulaireMap);
    const signification = resolveName(item.significationId, lookups.significationMap);
    const symboleSens = resolveName(item.symboleSensId, lookups.symboleSensMap);
    const symboleAccessory = resolveName(item.symboleAccessoryId, lookups.symboleAccessoryMap);

    if (filiere) entry['filiere'] = filiere;
    if (symbole) entry['symbole'] = symbole;
    if (placement) entry['placement'] = placement;
    if (position) entry['position'] = position;
    if (circulaire) entry['circulaire'] = circulaire;
    if (signification) entry['signification'] = signification;
    if (symboleSens) entry['symboleSens'] = symboleSens;
    if (symboleAccessory) entry['symboleAccessory'] = symboleAccessory;
    if (item.spe) entry['spe'] = item.spe;
    if (item.absent) entry['absent'] = item.absent;
    if (item.blame) entry['blame'] = item.blame;
    if (item.note) entry['note'] = item.note;

    return entry;
  });

  return `Code de base sélectionné : "${code.name} - ${code.annee}".
Produis un diff (add / update / remove) par rapport à ces relations existantes plutôt que de tout redéfinir depuis zéro :
${JSON.stringify(simplified, null, 2)}`;
}

export function buildImportPrompt(params: {
  refs: ReferentialLists;
  selectedCode: IRelationData | null;
  lookups: RelationLookups;
}): string {
  const sections = [
    'Tu es un assistant chargé de transformer le contenu d\'un PDF (circulaire militaire) en un batch de modifications structuré pour la base de données Falidex.',
    `Format JSON attendu :\n${JSON_SCHEMA_BLOCK}`,
    EXTRACTION_RULES,
    `Référentiels existants (à utiliser pour rapprocher les libellés par nom au lieu de créer des doublons) :\n${buildReferentialsBlock(params.refs)}`
  ];

  if (params.selectedCode) {
    sections.push(buildSelectedCodeBlock(params.selectedCode, params.lookups));
  } else {
    sections.push('Aucun code de base sélectionné : toutes les entités et relations extraites du PDF doivent être créées ("op": "add").');
  }

  return sections.join('\n\n');
}
