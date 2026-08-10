import { DiffEntityType, DiffOption } from '../../models/diff-row.model';
import { DiffEntry } from './importer-batch-edit.service';

/**
 * Contenu du brouillon d'import en cours (JSON collé + revue + corrections), tel qu'envoyé au
 * serveur pour permettre de reprendre le travail sur un autre poste ou de l'annuler.
 */
export interface ImporterDraftContent {
  pastedJson: string;
  selectedCodeId: string | null;
  entries: DiffEntry[];
  referentialOptions: Partial<Record<DiffEntityType, DiffOption[]>>;
  targetCode: { id: string; name: string; annee?: number } | null;
  importName: string;
  newFicheName: string;
  newFicheAnnee: number | null;
}

/** Brouillon tel que restitué par `GET /collection/import-draft` : le contenu, horodaté côté serveur. */
export interface ImporterDraft {
  savedAt: string;
  payload: ImporterDraftContent;
}
