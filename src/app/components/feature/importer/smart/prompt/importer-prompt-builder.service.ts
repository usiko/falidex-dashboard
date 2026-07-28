import { Injectable } from '@angular/core';
import { IRelationData, IRelationItem } from '../../../../../models/data/base-relations.models';
import { IBaseCollectionData } from '../../../../../models/data/base-data-models';
import importJsonSchema from './import-json-schema.json';
import extractionRules from './extraction-rules.json';

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

export interface BuildImportPromptParams {
  refs: ReferentialLists;
  selectedCode: IRelationData | null;
  lookups: RelationLookups;
}

function buildExtractionRulesBlock(): string {
  const rulesList = extractionRules.rules.map((rule) => `- ${rule}`).join('\n');
  const examplesList = extractionRules.fewShotExamples
    .map((example, index) => `Exemple ${index + 1} : ${example.description}\n${JSON.stringify(example.output, null, 2)}`)
    .join('\n\n');

  return `Consignes d'extraction :\n${rulesList}\n\nExemples (few-shot) :\n${examplesList}`;
}

@Injectable({
  providedIn: 'root'
})
export class ImporterPromptBuilderService {
  buildPrompt(params: BuildImportPromptParams): string {
    const sections = [
      'Tu es un assistant chargé de transformer le contenu d\'un PDF (circulaire militaire) en un batch de modifications structuré pour la base de données Falidex.',
      `Schéma JSON attendu (JSON Schema) :\n${JSON.stringify(importJsonSchema, null, 2)}`,
      buildExtractionRulesBlock(),
      `Référentiels existants (à utiliser pour rapprocher les libellés par nom au lieu de créer des doublons) :\n${this.buildReferentialsBlock(params.refs)}`
    ];

    if (params.selectedCode) {
      sections.push(this.buildSelectedCodeBlock(params.selectedCode, params.lookups));
    } else {
      sections.push('Aucun code de base sélectionné : toutes les entités et relations extraites du PDF doivent être créées ("op": "add").');
    }

    return sections.join('\n\n');
  }

  buildReferentialsBlock(refs: ReferentialLists): string {
    return [
      this.formatNamesList('Couleurs existantes', refs.colors),
      this.formatNamesList('Filières existantes', refs.filieres),
      this.formatNamesList('Symboles existants', refs.symbols),
      this.formatNamesList('Placements existants', refs.placements),
      this.formatNamesList('Positions existantes', refs.positions),
      this.formatNamesList('Significations existantes', refs.significations)
    ].join('\n');
  }

  buildSelectedCodeBlock(code: IRelationData, lookups: RelationLookups): string {
    const simplified = code.relations.map((item: IRelationItem) => {
      const entry: Record<string, unknown> = { id: item.id };
      const filiere = this.resolveName(item.filiereId, lookups.filiereMap);
      const symbole = this.resolveName(item.symboleId, lookups.symboleMap);
      const placement = this.resolveName(item.placementId, lookups.placementMap);
      const position = this.resolveName(item.positionId, lookups.positionMap);
      const circulaire = this.resolveName(item.circulaireId, lookups.circulaireMap);
      const signification = this.resolveName(item.significationId, lookups.significationMap);
      const symboleSens = this.resolveName(item.symboleSensId, lookups.symboleSensMap);
      const symboleAccessory = this.resolveName(item.symboleAccessoryId, lookups.symboleAccessoryMap);

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

  private formatNamesList(label: string, items: IBaseCollectionData[]): string {
    const names = items.map((i) => i.name).filter((n): n is string => !!n);
    return `${label} (${names.length}) : ${names.length ? names.join(', ') : 'aucun'}`;
  }

  private resolveName(id: string | undefined, map: Record<string, IBaseCollectionData>): string | undefined {
    return id ? map[id]?.name : undefined;
  }
}
