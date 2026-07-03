import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CurrentUserStore } from '../stores/current-user/current-user.store';

export const authGuard: CanActivateFn = () => {
  const currentUserStore = inject(CurrentUserStore);
  const router = inject(Router);

  if (currentUserStore.user()) {
    return true;
  }

  return router.createUrlTree(['/filieres']);
};
