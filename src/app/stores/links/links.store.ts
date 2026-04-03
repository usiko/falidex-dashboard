import { computed, Signal } from '@angular/core';
import { signalStore, withMethods } from '@ngrx/signals';
import { withEntities } from '@ngrx/signals/entities';
import { createEntityMethods } from '../entities.store';
import { IRelationItem } from '../../models/data/base-relations.models';

export const linkStore = signalStore(
  { providedIn: 'root' },
  withEntities<IRelationItem>(),
  withMethods((store) => ({
    // Méthodes génériques communes
    ...createEntityMethods<IRelationItem>()(store)
  })),
);