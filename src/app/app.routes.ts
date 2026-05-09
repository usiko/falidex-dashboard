import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'filieres',
    pathMatch: 'full'
  },
  {
    path: 'filieres',
    loadComponent: () => import('./components/feature/filieres/page/filieres-list.page').then(m => m.FilieresListPageComponent)
  },
  {
    path: 'filiere/:id',
    loadComponent: () => import('./components/feature/filieres/page/detail/filiere-detail-page.component').then(m => m.FiliereDetailPageComponent)
  },
  {
    path: 'symbols',
    loadComponent: () => import('./components/feature/symbols/page/symbols-list.page').then(m => m.SymbolsListPageComponent)
  },
  {
    path: 'symbole/:id',
    loadComponent: () => import('./components/feature/symbols/page/detail/symbol-detail-page.component').then(m => m.SymbolDetailPageComponent)
  },
  {
    path: 'relation/:id/symbole/edit',
    loadComponent: () => import('./components/feature/relations/page/symbole-edit/relation-symbole-edit-page.component').then(m => m.RelationSymboleEditPageComponent)
  },
  {
    path: 'relation/symbole/new',
    loadComponent: () => import('./components/feature/relations/page/symbole-edit/relation-symbole-edit-page.component').then(m => m.RelationSymboleEditPageComponent)
  },
  {
    path: 'relation/current/edit',
    loadComponent: () => import('./components/feature/relations/page/edit/relation-edit-page.component').then(m => m.RelationEditPageComponent)
  },
  {
    path: 'relation/new',
    loadComponent: () => import('./components/feature/relations/page/new/relation-new-page.component').then(m => m.RelationNewPageComponent)
  },
  {
    path: 'relation/:id/filiere/edit',
    loadComponent: () => import('./components/feature/relations/page/filiere-edit/relation-filiere-edit-page.component').then(m => m.RelationFiliereEditPageComponent)
  },
  {
    path: 'relation/filiere/new',
    loadComponent: () => import('./components/feature/relations/page/filiere-edit/relation-filiere-edit-page.component').then(m => m.RelationFiliereEditPageComponent)
  },
  {
    path: 'significations',
    loadComponent: () => import('./components/feature/significations/page/significations-list.page').then(m => m.SignificationsListPageComponent)
  },
  {
    path: 'placements',
    loadComponent: () => import('./components/feature/placements/page/placements-list.page').then(m => m.PlacementsListPageComponent)
  },
  {
    path: 'symbols-accessory',
    loadComponent: () => import('./components/feature/symbols-accessory/page/symbols-accessory-list.page').then(m => m.SymbolsAccessoryListPageComponent)
  },
  {
    path: 'positions',
    loadComponent: () => import('./components/feature/positions/page/positions-list.page').then(m => m.PositionsListPageComponent)
  },
  {
    path: 'circulaires',
    loadComponent: () => import('./components/feature/circulaires/page/circulaires-list.page').then(m => m.CirculairesListPageComponent)
  },
  {
    path: 'colors',
    loadComponent: () => import('./components/feature/colors/page/colors-list.page').then(m => m.ColorsListPageComponent)
  },
  {
    path: '**',
    redirectTo: 'filieres'
  }
];
