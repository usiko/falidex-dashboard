import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy } from '@angular/router';

export class CustomRouteReuseStrategy implements RouteReuseStrategy {
  private handlers: Map<string, DetachedRouteHandle> = new Map();

  // Liste des routes à réutiliser (pages de liste)
  // La réutilisation de route préserve l'état des composants (signaux, filtres, scroll)
  private readonly routesToCache = [
    '/symbols',
    '/filieres',
    '/table',
    '/colors',
    '/circulaires',
    '/placements',
    '/positions',
    '/significations',
    '/symbols-accessory'
  ];

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    // Détacher (sauvegarder) la route si elle fait partie de la liste
    const path = this.getRoutePath(route);
    return this.routesToCache.includes(path);
  }

  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null): void {
    // Stocker la route détachée
    if (handle) {
      const path = this.getRoutePath(route);
      this.handlers.set(path, handle);
    }
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    // Réattacher (réutiliser) la route si elle a été stockée
    const path = this.getRoutePath(route);
    return this.handlers.has(path);
  }

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    // Récupérer la route stockée
    const path = this.getRoutePath(route);
    return this.handlers.get(path) || null;
  }

  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    // Déterminer si la route doit être réutilisée (comportement par défaut)
    return future.routeConfig === curr.routeConfig;
  }

  private getRoutePath(route: ActivatedRouteSnapshot): string {
    // Construire le chemin complet de la route
    let path = '';
    let currentRoute: ActivatedRouteSnapshot | null = route;
    
    while (currentRoute) {
      if (currentRoute.routeConfig && currentRoute.routeConfig.path) {
        const segment = currentRoute.routeConfig.path;
        // Extraire seulement la partie avant le paramètre (avant ':')
        const basePath = segment.split(':')[0];
        
        if (basePath) {
          path = '/' + basePath + path;
        }
      }
      currentRoute = currentRoute.parent;
    }
    
    return path || '/';
  }
}
