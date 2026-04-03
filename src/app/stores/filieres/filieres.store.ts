import { computed, Signal } from '@angular/core';
import { signalStore, withMethods } from '@ngrx/signals';
import { withEntities } from '@ngrx/signals/entities';
import { createEntityMethods } from '../entities.store';
import { IFiliere } from '../../models/data/linked-data-models';

export const FiliereStore = signalStore(
  { providedIn: 'root' },
  withEntities<IFiliere>(),
  withMethods((store) => ({
    // Méthodes génériques communes
    ...createEntityMethods<IFiliere>()(store)
  })),
);
