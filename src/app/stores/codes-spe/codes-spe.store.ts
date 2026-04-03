import { computed, Signal } from '@angular/core';
import { signalStore, withMethods } from '@ngrx/signals';
import { withEntities } from '@ngrx/signals/entities';
import { createEntityMethods } from '../entities.store';
import { ICodeSpe } from '../../models/data/linked-data-models';

export const CodeSpeStore = signalStore(
  { providedIn: 'root' },
  withEntities<ICodeSpe>(),
  withMethods((store) => ({
    // Méthodes génériques communes
    ...createEntityMethods<ICodeSpe>()(store)
  })),
);
