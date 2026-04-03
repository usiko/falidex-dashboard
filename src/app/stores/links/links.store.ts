import { computed, Signal } from '@angular/core';
import { signalStore, withMethods } from '@ngrx/signals';
import { withEntities } from '@ngrx/signals/entities';
import { createEntityMethods } from '../entities.store';
import { ICirculaire, ICollectionLink } from '../../models/data/linked-data-models';

export const linkStore = signalStore(
  { providedIn: 'root' },
  withEntities<ICollectionLink>(),
  withMethods((store) => ({
    // Méthodes génériques communes
    ...createEntityMethods<ICollectionLink>()(store)
  })),
);