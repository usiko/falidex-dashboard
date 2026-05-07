import { ApplicationConfig, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, RouteReuseStrategy } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { appInitiealizerFn } from './app.initializer';
import { httpInterceptor } from './services/http-interceptor/http-interceptor.service';
import { CustomRouteReuseStrategy } from './route-reuse-strategy';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAppInitializer(appInitiealizerFn),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    provideHttpClient(withInterceptors([httpInterceptor])),
    { provide: RouteReuseStrategy, useClass: CustomRouteReuseStrategy }
  ]
};
