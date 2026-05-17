import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { SelectedRelationStorageService } from '../../services/storage/selected-relation-storage.service';

interface SelectedRelationState {
  selectedRelationId: string | null;
  isEditable:boolean;
  isNational:boolean;
}

export const SelectedRelationStore = signalStore(
  { providedIn: 'root' },
  withState<SelectedRelationState>({
    selectedRelationId: null,
    isEditable:false,
    isNational:false
  }),
  withMethods((store) => {
    const storageService = inject(SelectedRelationStorageService);
    
    return {
      setSelectedRelationId(relationId: string, isEditable: boolean | undefined, isNational: boolean | undefined): void {
        patchState(store, { 
          selectedRelationId: relationId,
          isEditable: isEditable !== undefined ? isEditable : true,
          isNational: isNational !== undefined ? isNational : false 
        });
        
        // Sauvegarder dans le localStorage
        storageService.saveSelectedRelationId(relationId);
      },
      clearSelection(): void {
        patchState(store, { selectedRelationId: null });
        storageService.clearSelectedRelationId();
      }
    };
  })
);
