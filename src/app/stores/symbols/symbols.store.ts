import { computed, Signal } from '@angular/core';
import { signalStore, withMethods } from '@ngrx/signals';
import { withEntities } from '@ngrx/signals/entities';
import { createEntityMethods } from '../entities.store';
import { IBaseSymbol } from '../../models/data/base-data-models';

export const SymbolStore = signalStore(
  { providedIn: 'root' },
  withEntities<IBaseSymbol>(),
  withMethods((store) => ({
    // Méthodes génériques communes
    ...createEntityMethods<IBaseSymbol>()(store)
  })),
);
