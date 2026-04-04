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
    ...createEntityMethods<IRelationItem>()(store),
    
    // Méthode pour récupérer les liens par filiereId
    getByFiliereId: (filiereId: string) => {
      return computed(() => {
        return store.entities().filter(link => link.filiereId === filiereId)
      }
      );
    },

    // Méthode pour récupérer les liens par symboleId
    getBySymboleId: (symboleId: string) => {
      return computed(() => {
        return store.entities().filter(link => link.symboleId === symboleId)
      }
      );
    },

    // Statistiques pour une filière
    getFiliereStats: (filiereId: string) => {
      return computed(() => {
        const links = store.entities().filter(link => link.filiereId === filiereId);
        const uniqueSymboles = new Set(links.map(link => link.symboleId).filter(Boolean));
        const uniqueSignifications = new Set(links.map(link => link.significationId).filter(Boolean));
        
        return {
          symboleCount: uniqueSymboles.size,
          significationCount: uniqueSignifications.size
        };
      });
    },

    // Statistiques pour un symbole
    getSymboleStats: (symboleId: string) => {
      return computed(() => {
        const links = store.entities().filter(link => link.symboleId === symboleId);
        const uniqueFilieres = new Set(links.map(link => link.filiereId).filter(Boolean));
        const uniqueSignifications = new Set(links.map(link => link.significationId).filter(Boolean));
        
        return {
          filiereCount: uniqueFilieres.size,
          significationCount: uniqueSignifications.size
        };
      });
    }
    
    
  })),
);