import { computed, Signal } from '@angular/core';
import { signalStore, withMethods } from '@ngrx/signals';
import { withEntities } from '@ngrx/signals/entities';
import { createEntityMethods } from '../entities.store';
import { IPosition } from '../../models/data/linked-data-models';

export const PositionStore = signalStore(
  { providedIn: 'root' },
  withEntities<IPosition>(),
  withMethods((store) => ({
    // Méthodes génériques communes
    ...createEntityMethods<IPosition>()(store)
  })),
);
