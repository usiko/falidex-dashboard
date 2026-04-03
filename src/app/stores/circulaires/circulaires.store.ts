import { computed, Signal } from '@angular/core';
import { signalStore, withMethods } from '@ngrx/signals';
import { withEntities } from '@ngrx/signals/entities';
import { createEntityMethods } from '../entities.store';
import { ICirculaire } from '../../models/data/linked-data-models';

export const CirculaireStore = signalStore(
  { providedIn: 'root' },
  withEntities<ICirculaire>(),
  withMethods((store) => ({
    // Méthodes génériques communes
    ...createEntityMethods<ICirculaire>()(store)
  })),
);