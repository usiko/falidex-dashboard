import { computed, Signal } from '@angular/core';
import { signalStore, withMethods } from '@ngrx/signals';
import { withEntities } from '@ngrx/signals/entities';
import { createEntityMethods } from '../entities.store';
import { IBasePosition } from '../../models/data/base-data-models';

export const PositionStore = signalStore(
  { providedIn: 'root' },
  withEntities<IBasePosition>(),
  withMethods((store) => ({
    // Méthodes génériques communes
    ...createEntityMethods<IBasePosition>()(store)
  })),
);
