import { computed, Signal } from '@angular/core';
import { signalStore, withMethods } from '@ngrx/signals';
import { withEntities } from '@ngrx/signals/entities';
import { createEntityMethods, withLoadingState } from '../entities.store';
import { IBaseCodeSpe } from '../../models/data/base-data-models';

export const CodeSpeStore = signalStore(
  { providedIn: 'root' },
  ...withLoadingState(),
  withEntities<IBaseCodeSpe>(),
  withMethods((store) => ({
    // Méthodes génériques communes
    ...createEntityMethods<IBaseCodeSpe>()(store)
  })),
);
