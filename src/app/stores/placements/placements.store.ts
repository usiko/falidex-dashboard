import { computed, Signal } from '@angular/core';
import { signalStore, withMethods } from '@ngrx/signals';
import { withEntities } from '@ngrx/signals/entities';
import { createEntityMethods, withLoadingState } from '../entities.store';
import { IBasePlacement } from '../../models/data/base-data-models';

export const PlacementStore = signalStore(
  { providedIn: 'root' },
  ...withLoadingState(),
  withEntities<IBasePlacement>(),
  withMethods((store) => ({
    // Méthodes génériques communes
    ...createEntityMethods<IBasePlacement>()(store)
  })),
);
