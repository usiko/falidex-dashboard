import { computed, Signal } from '@angular/core';
import { signalStore, withMethods } from '@ngrx/signals';
import { withEntities } from '@ngrx/signals/entities';
import { createEntityMethods } from '../entities.store';
import { IBaseFiliere } from '../../models/data/base-data-models';

export const FiliereStore = signalStore(
  { providedIn: 'root' },
  withEntities<IBaseFiliere>(),
  withMethods((store) => ({
    // Méthodes génériques communes
    ...createEntityMethods<IBaseFiliere>()(store)
  })),
);
