import { computed, Signal } from '@angular/core';
import { signalStore, withMethods } from '@ngrx/signals';
import { withEntities } from '@ngrx/signals/entities';
import { createEntityMethods } from '../entities.store';
import { IBaseSymbolAcessory } from '../../models/data/base-data-models';

export const SymbolAccessoryStore = signalStore(
  { providedIn: 'root' },
  withEntities<IBaseSymbolAcessory>(),
  withMethods((store) => ({
    // Méthodes génériques communes
    ...createEntityMethods<IBaseSymbolAcessory>()(store)
  })),
);
