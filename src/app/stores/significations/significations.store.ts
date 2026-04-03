import { computed, Signal } from '@angular/core';
import { signalStore, withMethods } from '@ngrx/signals';
import { withEntities } from '@ngrx/signals/entities';
import { createEntityMethods } from '../entities.store';
import { ISignification } from '../../models/data/linked-data-models';

export const SignificationStore = signalStore(
  { providedIn: 'root' },
  withEntities<ISignification>(),
  withMethods((store) => ({
    // Méthodes génériques communes
    ...createEntityMethods<ISignification>()(store)
  })),
);
