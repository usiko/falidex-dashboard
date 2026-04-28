import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';

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
  withMethods((store) => ({
    setSelectedRelationId(relationId: string,isEditable:boolean|undefined, isNational:boolean|undefined): void {
        
      patchState(store, { selectedRelationId: relationId,isEditable:isEditable!==undefined?isEditable:true,isNational:isNational!==undefined?isNational:false });
    },
    clearSelection(): void {
      patchState(store, { selectedRelationId: null });
    }
  }))
);
