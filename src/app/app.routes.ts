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
    path: 'relation/:id/edit',
    loadComponent: () => import('./components/feature/relations/page/edit/relation-edit-page.component').then(m => m.RelationEditPageComponent)
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
    path: '**',
    redirectTo: 'filieres'
  }
];
