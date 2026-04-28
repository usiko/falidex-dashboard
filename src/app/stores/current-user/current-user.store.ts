import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { IUser } from '../../models/user.model';

interface CurrentUserState {
  user: IUser | null;
}

export const CurrentUserStore = signalStore(
  { providedIn: 'root' },
  withState<CurrentUserState>({
    user: null
  }),
  withMethods((store) => ({
    setUser(user: IUser): void {
      patchState(store, { user });
    },
    clearUser(): void {
      patchState(store, { user: null });
    }
  }))
);
