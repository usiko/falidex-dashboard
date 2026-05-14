import { computed, Signal } from '@angular/core';
import { signalStore, withMethods } from '@ngrx/signals';
import { withEntities } from '@ngrx/signals/entities';
import { createEntityMethods, withLoadingState } from '../entities.store';
import { IBaseColor } from '../../models/data/base-data-models';

export const ColorStore = signalStore(
  { providedIn: 'root' },
  ...withLoadingState(),
  withEntities<IBaseColor>(),
  withMethods((store) => ({
    // Méthodes génériques communes
    ...createEntityMethods<IBaseColor>()(store)
  })),
);
