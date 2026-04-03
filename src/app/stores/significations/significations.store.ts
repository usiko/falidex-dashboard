import { computed, Signal } from '@angular/core';
import { signalStore, withMethods } from '@ngrx/signals';
import { withEntities } from '@ngrx/signals/entities';
import { createEntityMethods } from '../entities.store';
import { IBaseSignification } from '../../models/data/base-data-models';

export const SignificationStore = signalStore(
  { providedIn: 'root' },
  withEntities<IBaseSignification>(),
  withMethods((store) => ({
    // Méthodes génériques communes
    ...createEntityMethods<IBaseSignification>()(store)
  })),
);
