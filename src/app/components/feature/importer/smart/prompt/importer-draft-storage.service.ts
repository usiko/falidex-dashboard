import { Injectable } from '@angular/core';
import { ImporterDraft } from './importer-draft.model';

const STORAGE_KEY = 'importerDraft';

@Injectable({
  providedIn: 'root'
})
export class ImporterDraftStorageService {
  save(draft: ImporterDraft): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // Stockage indisponible (mode privé, quota dépassé...) : la persistance est un confort, pas un prérequis.
    }
  }

  load(): ImporterDraft | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as ImporterDraft;
    } catch {
      return null;
    }
  }

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
