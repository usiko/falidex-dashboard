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
    path: 'symbols',
    loadComponent: () => import('./components/feature/symbols/page/symbols-list.page').then(m => m.SymbolsListPageComponent)
  },
  {
    path: '**',
    redirectTo: 'filieres'
  }
];
