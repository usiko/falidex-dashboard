import { Directive, ElementRef, OnInit, OnDestroy, input } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs';
import { ScrollPositionService } from '../services/scroll-position.service';

/**
 * Directive pour sauvegarder et restaurer automatiquement la position de scroll
 * Cherche automatiquement le conteneur scrollable le plus proche
 * Ne s'active que si elle est sur la route correspondante
 * Utilisation: <div appScrollRestore="key-unique">...</div>
 */
@Directive({
  selector: '[appScrollRestore]',
  standalone: true
})
export class ScrollRestoreDirective implements OnInit, OnDestroy {
  scrollKey = input.required<string>({ alias: 'appScrollRestore' });
  
  private scrollListener: (() => void) | null = null;
  private navigationSubscriptions: any[] = [];
  private restoreTimeout: any;
  private scrollContainer: HTMLElement | null = null;
  private ignoreScrollEvents = false;
  private isRouteActive = false;

  constructor(
    private el: ElementRef<HTMLElement>,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private scrollService: ScrollPositionService
  ) {}

  ngOnInit() {
    // Chercher le conteneur scrollable le plus proche
    this.scrollContainer = this.findScrollableContainer();
    
    if (!this.scrollContainer) {
      console.warn('[ScrollRestoreDirective] Aucun conteneur scrollable trouvé');
      return;
    }

    const key = this.scrollKey();
    console.log(`[ScrollRestoreDirective] Initialisation pour clé: ${key}, conteneur: ${this.scrollContainer.className}`);

    // Sauvegarder le scroll quand on scroll
    this.scrollListener = () => this.saveScrollPosition();
    this.scrollContainer.addEventListener('scroll', this.scrollListener);

    // Vérifier si on est sur la bonne route
    this.checkRouteActive();

    // Sauvegarder avant de naviguer
    const navStart = this.router.events
      .pipe(filter(event => event instanceof NavigationStart))
      .subscribe(() => {
        console.log(`[ScrollRestoreDirective] Sauvegarde avant navigation (${key})`);
        this.saveScrollPosition();
        this.ignoreScrollEvents = true; // Ignorer les scroll events pendant la navigation
      });
    this.navigationSubscriptions.push(navStart);

    // Vérifier la route active et restaurer si nécessaire
    const navEnd = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.checkRouteActive();
        if (this.isRouteActive) {
          console.log(`[ScrollRestoreDirective] Navigation terminée, planification restauration (${key})`);
          this.scheduleRestore(100);
        } else {
          console.log(`[ScrollRestoreDirective] Route non active (${key}), pas de restauration`);
          this.ignoreScrollEvents = false;
        }
      });
    this.navigationSubscriptions.push(navEnd);

    // Restaurer au premier chargement si on est sur la bonne route
    if (this.isRouteActive) {
      console.log(`[ScrollRestoreDirective] Premier chargement (${key})`);
      this.scheduleRestore(50);
    }
  }

  private checkRouteActive(): void {
    const key = this.scrollKey();
    const currentUrl = this.router.url.split('?')[0]; // Ignorer les query params
    
    // Extraire le chemin de base (avant les segments internes comme /scroll)
    const keyBasePath = key.split('/').slice(0, 2).join('/') || '/'; // ex: /table/scroll -> /table
    const urlBasePath = currentUrl.split('/').slice(0, 2).join('/') || '/'; // ex: /table -> /table
    
    // Vérifier si la route active correspond à la clé
    const wasActive = this.isRouteActive;
    
    // Deux conditions:
    // 1. Correspondance exacte: key === url
    // 2. La clé est une route parente: url commence par key/
    // 3. Même chemin de base (pour les sous-routes comme /table/scroll quand on est sur /table)
    this.isRouteActive = 
      (currentUrl === key) || 
      (currentUrl.startsWith(key + '/')) ||
      (keyBasePath === urlBasePath && (key.includes('/') || currentUrl.includes('/')));
    
    console.log(`[ScrollRestoreDirective] Route check: key="${key}" (base="${keyBasePath}"), url="${currentUrl}" (base="${urlBasePath}"), active=${this.isRouteActive}`);
    
    if (wasActive !== this.isRouteActive) {
      console.log(`[ScrollRestoreDirective] ⚠️ Route ACTIVE STATE CHANGED: ${wasActive} -> ${this.isRouteActive}`);
    }
  }

  private findScrollableContainer(): HTMLElement | null {
    // D'abord chercher un conteneur scrollable dans les enfants directs
    const element = this.el.nativeElement;
    
    // Vérifier si le conteneur courant a overflow: auto
    const style = window.getComputedStyle(element);
    if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
      console.log(`[ScrollRestoreDirective] Conteneur scrollable trouvé: ${element.className}`);
      return element;
    }

    // Chercher dans les enfants (ex: .table-scroll)
    let scrollableChild = element.querySelector('[style*="overflow"], .table-scroll, .scrollable');
    if (scrollableChild && scrollableChild instanceof HTMLElement) {
      const childStyle = window.getComputedStyle(scrollableChild);
      if (childStyle.overflowY === 'auto' || childStyle.overflowY === 'scroll') {
        console.log(`[ScrollRestoreDirective] Enfant scrollable trouvé: ${scrollableChild.className}`);
        return scrollableChild;
      }
    }

    // Sinon chercher .app-content
    const appContent = document.querySelector('.app-content');
    if (appContent && appContent instanceof HTMLElement) {
      console.log(`[ScrollRestoreDirective] Utilisation de .app-content`);
      return appContent;
    }

    return null;
  }

  private scheduleRestore(delay: number = 200): void {
    if (this.restoreTimeout) {
      clearTimeout(this.restoreTimeout);
    }

    this.restoreTimeout = setTimeout(() => {
      if (this.scrollContainer && this.isRouteActive) {
        this.restoreScrollPosition();
        // Réactiver la sauvegarde des scroll events après la restauration
        this.ignoreScrollEvents = false;
        console.log(`[ScrollRestoreDirective] ✅ Scroll events réactivés`);
      }
    }, delay);
  }

  private saveScrollPosition(): void {
    if (!this.scrollContainer) return;
    
    // Ignorer les scroll events pendant la navigation
    if (this.ignoreScrollEvents) {
      console.log(`[ScrollRestoreDirective] ⏭️ Scroll event ignoré (pendant navigation)`);
      return;
    }

    // Ne sauvegarder que si on est sur la route active
    if (!this.isRouteActive) {
      console.log(`[ScrollRestoreDirective] ⏭️ Scroll event ignoré (route non active)`);
      return;
    }
    
    const key = this.scrollKey();
    const scrollTop = this.scrollContainer.scrollTop;
    
    console.log(`[ScrollRestoreDirective] Sauvegarde scroll pour ${key}: ${scrollTop}px`);
    this.scrollService.saveScrollPosition(key, scrollTop);
  }

  private restoreScrollPosition(): void {
    if (!this.scrollContainer || !this.isRouteActive) return;
    
    const key = this.scrollKey();
    const savedPosition = this.scrollService.getScrollPosition(key);
    
    console.log(`[ScrollRestoreDirective] Restauration pour ${key}: position sauvegardée = ${savedPosition}px`);
    
    if (savedPosition !== undefined && savedPosition > 0) {
      console.log(`[ScrollRestoreDirective] ✅ Restauration du scroll à ${savedPosition}px`);
      this.scrollContainer.scrollTop = savedPosition;
    } else {
      console.log(`[ScrollRestoreDirective] ❌ Pas de position à restaurer (undefined ou 0)`);
    }
  }

  ngOnDestroy() {
    // Nettoyer les listeners
    if (this.scrollListener && this.scrollContainer) {
      this.scrollContainer.removeEventListener('scroll', this.scrollListener);
    }

    // Sauvegarder le scroll au moment de la destruction
    this.saveScrollPosition();

    // Nettoyer les subscriptions
    this.navigationSubscriptions.forEach(sub => sub.unsubscribe());

    if (this.restoreTimeout) {
      clearTimeout(this.restoreTimeout);
    }
  }
}
