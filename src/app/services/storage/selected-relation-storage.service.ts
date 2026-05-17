import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SelectedRelationStorageService {
  private readonly STORAGE_KEY = 'selectedRelationId';

  /**
   * Sauvegarde l'ID de la relation sélectionnée
   */
  saveSelectedRelationId(relationId: string): void {
    localStorage.setItem(this.STORAGE_KEY, relationId);
  }

  /**
   * Récupère l'ID de la relation sélectionnée depuis le localStorage
   */
  getSelectedRelationId(): string | null {
    return localStorage.getItem(this.STORAGE_KEY);
  }

  /**
   * Supprime l'ID de la relation sélectionnée
   */
  clearSelectedRelationId(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
