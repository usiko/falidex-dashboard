import { computed, Signal } from '@angular/core';
import { patchState, signalStore, withMethods } from '@ngrx/signals';
import { addEntity, removeEntity, setAllEntities, updateEntity, withEntities } from '@ngrx/signals/entities';
import { v6 } from 'uuid';
import { BehaviorSubject, Subject } from 'rxjs';

/**
 * Interface pour les subjects d'événements CRUD
 */
export interface EntityEventSubjects<T> {
  onAdd$?: Subject<{ id: string; entity: T; send:boolean }>;
  onCreate$?: Subject<{ id: string; entity: T; send:boolean }>;
  onRemove$?: Subject<{ id: string; send:boolean }>;
  onUpdate$?: Subject<{ id: string; changes: Partial<T>, old:T,send:boolean}>;
  onSet$?: Subject<{ entities: T[] }>;
  onClear$?: Subject<void>;
  onLoadIdsChange$: BehaviorSubject<string[]>;
}

/**
 * Méthodes génériques communes à tous les stores d'entités
 */
export function createEntityMethods<T extends { id: string }, TAdditional = any>(additionalSubjects?: TAdditional) {
  // Créer les subjects directement dans la fonction
  const subjects: EntityEventSubjects<T> = {
    onAdd$: new Subject<{ id: string; entity: T,send:boolean }>(),
    onCreate$: new Subject<{ id: string; entity: T,send:boolean }>(),
    onRemove$: new Subject<{ id: string,send:boolean }>(),
    onUpdate$: new Subject<{ id: string; changes: Partial<T>, old:T,send:boolean }>(),
    onSet$: new Subject<{ entities: T[] }>(),
    onClear$: new Subject<void>(),
    onLoadIdsChange$: new BehaviorSubject<string[]>([]),
  };

  return (store: any) => ({
    /**
     * Exposer les subjects pour que les composants puissent s'y abonner
     */
    getEvents() {
      return subjects;
    },

    /**
     * Exposer les subjects additionnels pour que les composants puissent s'y abonner
     */
    getAdditionalEvents(): TAdditional | {} {
      return additionalSubjects || {};
    },
    /**
     * Récupère plusieurs entités par leurs IDs
     */
    getByIds(ids: string[]) {
      return computed(() => {
        return ids.reduce((acc: T[], id: string) => {
          const entity = store.entityMap()[id];
          if (entity) {
            acc.push(entity);
          }
          return acc;
        }, []);
      });
    },

    loadByIds(ids: string[]) {
      subjects.onLoadIdsChange$.next(ids);
    },

    addIdToLoad(ids: string[]) {
      const currentIds = subjects.onLoadIdsChange$.getValue();
      const newIds = ids.filter((id) => !currentIds.includes(id));
      subjects.onLoadIdsChange$.next([...currentIds, ...newIds]);
    },

    /**
     * Récupère une entité par son ID
     */
    getById(id: string) {
      return computed<T | undefined>(() => {
        return store.entityMap()[id] || undefined;
      });
    },

    /**
     * Récupère la première entité du store
     */
    getFirst() {
      return computed<T | undefined>(() => {
        const entities = store.entities();
        return entities.length > 0 ? entities[0] : undefined;
      });
    },

    /**
     * Récupère la dernière entité du store
     */
    getLast() {
      return computed<T | undefined>(() => {
        const entities = store.entities();
        return entities.length > 0 ? entities[entities.length - 1] : undefined;
      });
    },

    /**
     * Ajoute une entité existante au store
     */
    add(item: T, send:boolean=true) {
      patchState(store, addEntity(item));
      subjects.onAdd$?.next({ id: item.id, entity: item, send:!!send });
    },

    /**
     * Crée et ajoute une nouvelle entité avec un ID généré
     */
    create(item: Omit<T, 'id'>, send:boolean=true) {
      const id = v6();
      const newItem = { id, ...item } as T;
      patchState(store, addEntity(newItem));
      subjects.onCreate$?.next({ id, entity: newItem, send:!!send });
      return id;
    },

    create_whithoutStore(item: Omit<T, 'id'>, send:boolean=true) {
      const id = v6();
      const newItem = { id, ...item } as T;
      subjects.onCreate$?.next({ id, entity: newItem, send:!!send });
      return id;
    },

    /**
     * Remplace toutes les entités du store
     */
    set(items: T[]) {
      patchState(store, setAllEntities(items));
      subjects.onSet$?.next({ entities: items });
    },

    set_withoutStore(items: T[]) {
      subjects.onSet$?.next({ entities: items });
    },

    /**
     * Supprime une entité par son ID
     */
    remove(id: string, send:boolean=true) {
      patchState(store, removeEntity(id));
      subjects.onRemove$?.next({ id, send:!!send });
    },

    /**
     * Met à jour une entité existante
     */
    update(id: string, item: Partial<T>,send:boolean=true) {
      const old = this.getById(id)();
      if(old)
      {
        // Calculer uniquement les propriétés qui ont réellement changé
        const actualChanges: Partial<T> = {};
        for (const key in item) {
          if (item.hasOwnProperty(key)) {
            const oldValue = (old as any)[key];
            const newValue = (item as any)[key];
            
            // Comparer les valeurs (deep comparison pour les objets/arrays)
            if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
              (actualChanges as any)[key] = newValue;
            }
          }
        }
        
        patchState(
            store,
            updateEntity({
            id,
            changes: item,
            }),
        );
        subjects.onUpdate$?.next({ id, changes: actualChanges, old,send:!!send });
      }
      
      
    },

    /**
     * Vide complètement le store
     */
    clear() {
      this.clearStore();
      subjects.onLoadIdsChange$.next([]);
      subjects.onClear$?.next();
    },

    /**
     * clear only on store
     */
    clearStore() {
      patchState(store, setAllEntities([]));
    },


    /**
     * Compte le nombre total d'entités
     */
    count() {
      return computed(() => store.entities().length);
    },

    /**
     * Vérifie si une entité existe par son ID
     */
    exists(id: string) {
      return computed(() => !!store.entityMap()[id]);
    },

    /**
     * Query avancée avec filtres et tris multiples
     * @param filters Tableau de filtres { prop, op, value }
     * @param sorts Tableau de tris { prop, direction }
     * @returns Signal<T[]>
     */
    query(
      filters: Array<{ prop: string; op: 'eq' | 'ne' | 'gt' | 'lt' | 'contains'; value: any }> = [],
      sorts: Array<{ prop: string; direction: 'asc' | 'desc' }> = [],
    ): Signal<T[]> {
      function getProp(obj: any, path: string): any {
        return path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), obj);
      }
      return computed(() => {
        let result = store.entities();
        // Appliquer les filtres
        for (const filter of filters) {
          result = result.filter((item: any) => {
            const val = getProp(item, filter.prop);
            switch (filter.op) {
              case 'eq':
                return val === filter.value;
              case 'ne':
                return val !== filter.value;
              case 'gt':
                return val > filter.value;
              case 'lt':
                return val < filter.value;
              case 'contains':
                if (Array.isArray(val)) {
                  return val.includes(filter.value);
                }
                if (typeof val === 'string') {
                  return val.includes(filter.value);
                }
                return false;
              default:
                return true;
            }
          });
        }
        // Appliquer les tris
        for (let i = sorts.length - 1; i >= 0; i--) {
          const sort = sorts[i];
          result = [...result].sort((a, b) => {
            const va = getProp(a, sort.prop);
            const vb = getProp(b, sort.prop);
            if (va === vb) return 0;
            if (va === undefined) return 1;
            if (vb === undefined) return -1;
            return sort.direction === 'asc' ? (va > vb ? 1 : -1) : va < vb ? 1 : -1;
          });
        }
        return result;
      });
    },
  });
}
