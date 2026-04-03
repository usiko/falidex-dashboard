import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';

interface SelectedRelationState {
  selectedRelationId: string | null;
}

export const SelectedRelationStore = signalStore(
  { providedIn: 'root' },
  withState<SelectedRelationState>({
    selectedRelationId: null
  }),
  withMethods((store) => ({
    setSelectedRelationId(relationId: string): void {
      patchState(store, { selectedRelationId: relationId });
    },
    clearSelection(): void {
      patchState(store, { selectedRelationId: null });
    }
  }))
);
