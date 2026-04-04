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
    loadComponent: () => import('./components/feature/filieres/page/detail/smart/filiere-detail-page/filiere-detail-page.component').then(m => m.FiliereDetailPageComponent)
  },
  {
    path: 'symbols',
    loadComponent: () => import('./components/feature/symbols/page/symbols-list.page').then(m => m.SymbolsListPageComponent)
  },
  {
    path: 'symbole/:id',
    loadComponent: () => import('./components/feature/symbols/page/detail/smart/symbol-detail-page/symbol-detail-page.component').then(m => m.SymbolDetailPageComponent)
  },
  {
    path: '**',
    redirectTo: 'filieres'
  }
];
