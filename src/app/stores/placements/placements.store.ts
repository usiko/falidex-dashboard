import { computed, Signal } from '@angular/core';
import { signalStore, withMethods } from '@ngrx/signals';
import { withEntities } from '@ngrx/signals/entities';
import { createEntityMethods } from '../entities.store';
import { IPlacement } from '../../models/data/linked-data-models';

export const PlacementStore = signalStore(
  { providedIn: 'root' },
  withEntities<IPlacement>(),
  withMethods((store) => ({
    // Méthodes génériques communes
    ...createEntityMethods<IPlacement>()(store)
  })),
);
