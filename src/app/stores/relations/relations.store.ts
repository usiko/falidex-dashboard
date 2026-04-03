import { computed, Signal } from '@angular/core';
import { signalStore, withMethods } from '@ngrx/signals';
import { withEntities } from '@ngrx/signals/entities';
import { createEntityMethods } from '../entities.store';
import { IRelationData } from '../../models/data/base-relations.models';

export const RelationDataStore = signalStore(
  { providedIn: 'root' },
  withEntities<IRelationData>(),
  withMethods((store) => ({
    // Méthodes génériques communes
    ...createEntityMethods<IRelationData>()(store)
  })),
);
