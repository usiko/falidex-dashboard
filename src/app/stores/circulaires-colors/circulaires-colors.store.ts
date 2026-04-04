import { computed, Signal } from '@angular/core';
import { signalStore, withMethods } from '@ngrx/signals';
import { withEntities } from '@ngrx/signals/entities';
import { createEntityMethods } from '../entities.store';
import { IBaseCirculaireColor } from '../../models/data/base-data-models';

export const CirculaireColorStore = signalStore(
  { providedIn: 'root' },
  withEntities<IBaseCirculaireColor>(),
  withMethods((store) => ({
    // Méthodes génériques communes
    ...createEntityMethods<IBaseCirculaireColor>()(store),
    
    // Méthode pour récupérer les circulaire-colors par circulaireId
    getByCirculaireId: (circulaireId: string) => {
      return computed(() => {
        return store.entities().filter(cc => cc.circulaireId === circulaireId);
      });
    }
  })),
);
