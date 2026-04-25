import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';

interface SelectedRelationState {
  selectedRelationId: string | null;
  isEditable:boolean
}

export const SelectedRelationStore = signalStore(
  { providedIn: 'root' },
  withState<SelectedRelationState>({
    selectedRelationId: null,
    isEditable:false
  }),
  withMethods((store) => ({
    setSelectedRelationId(relationId: string,isEditable:boolean): void {
      patchState(store, { selectedRelationId: relationId,isEditable });
    },
    clearSelection(): void {
      patchState(store, { selectedRelationId: null });
    }
  }))
);
