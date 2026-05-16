import { computed, Signal } from '@angular/core';
import { signalStore, withMethods } from '@ngrx/signals';
import { withEntities } from '@ngrx/signals/entities';
import { createEntityMethods, withLoadingState } from '../entities.store';
import { IBaseSymbolSens } from '../../models/data/base-data-models';

export const SymbolSensStore = signalStore(
  { providedIn: 'root' },
  ...withLoadingState(),
  withEntities<IBaseSymbolSens>(),
  withMethods((store) => ({
    // Méthodes génériques communes
    ...createEntityMethods<IBaseSymbolSens>()(store)
  })),
);
