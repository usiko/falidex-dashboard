import { computed, Signal } from '@angular/core';
import { signalStore, withMethods } from '@ngrx/signals';
import { withEntities } from '@ngrx/signals/entities';
import { createEntityMethods, withLoadingState } from '../entities.store';
import { IBaseCirculaire } from '../../models/data/base-data-models';

export const CirculaireStore = signalStore(
  { providedIn: 'root' },
  ...withLoadingState(),
  withEntities<IBaseCirculaire>(),
  withMethods((store) => ({
    // Méthodes génériques communes
    ...createEntityMethods<IBaseCirculaire>()(store)
  })),
);