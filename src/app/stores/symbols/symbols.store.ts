import { computed, Signal } from '@angular/core';
import { signalStore, withMethods } from '@ngrx/signals';
import { withEntities } from '@ngrx/signals/entities';
import { createEntityMethods } from '../entities.store';
import { ISymbol } from '../../models/data/linked-data-models';

export const SymbolStore = signalStore(
  { providedIn: 'root' },
  withEntities<ISymbol>(),
  withMethods((store) => ({
    // Méthodes génériques communes
    ...createEntityMethods<ISymbol>()(store)
  })),
);
