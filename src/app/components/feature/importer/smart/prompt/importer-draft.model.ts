import { DiffEntityType, DiffOption } from '../../models/diff-row.model';
import { DiffEntry } from './importer-batch-edit.service';

/**
 * Snapshot complet de l'import en cours (JSON collé + revue + corrections), persisté pour permettre
 * de reprendre le travail après un rechargement de page ou de l'annuler explicitement.
 */
export interface ImporterDraft {
  savedAt: string;
  pastedJson: string;
  selectedCodeId: string | null;
  entries: DiffEntry[];
  referentialOptions: Partial<Record<DiffEntityType, DiffOption[]>>;
  targetCode: { id: string; name: string; annee?: number } | null;
  importName: string;
  newFicheName: string;
  newFicheAnnee: number | null;
}
