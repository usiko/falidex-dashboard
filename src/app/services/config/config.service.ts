import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';
import { IAppConfig } from './model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private http = inject(HttpClient);
  config$ = new BehaviorSubject<IAppConfig | undefined>(undefined);
  constructor() {}
  load() {
    return this.http.get<IAppConfig>('/config/config.json').pipe(
      tap((data) => {
        this.config$.next(data);
      }),
    );
  }
}
