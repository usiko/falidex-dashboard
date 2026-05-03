import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { AppConfigService } from '../config/app.config.service';
import { environment } from '../../../environments/environment';


export const httpInterceptor: HttpInterceptorFn = (
    request: HttpRequest<unknown>, 
    next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
    const authService = inject(AuthService);
    const configService = inject(AppConfigService);
    const tokenHeader = environment.tokenHeader;
    const dataBaseUrl = configService.getConfig()?.urls.dataServer;
    const tokenPath = configService.getConfig()?.paths.token;
    
    // Si la requête ne commence pas par dataBaseUrl, on laisse passer sans modification
    if (!dataBaseUrl || !request.url.startsWith(dataBaseUrl)) {
        return next(request);
    }
    
    // Si c'est la requête pour obtenir le token, on laisse passer sans le header (sinon boucle infinie)
    const tokenUrl = dataBaseUrl && tokenPath ? `${dataBaseUrl}/${tokenPath}` : null;
    if (tokenUrl && request.url === tokenUrl) {
        return next(request);
    }
    
    // Sinon, on applique la logique d'authentification
    return authService.getToken().pipe(
        switchMap(token => {
            return authService.getCurrentAuthToken().pipe(
                switchMap(authToken => {
                    // Cloner la requête avec les tokens dans les headers
                    let clonedRequest = request;
                    
                    // Ajouter le X-Token si disponible
                    if (token) {
                        clonedRequest = clonedRequest.clone({ 
                            headers: clonedRequest.headers.set(tokenHeader, token) 
                        });
                    }
                    
                    // Ajouter le JWT dans Authorization si disponible
                    if (authToken) {
                        clonedRequest = clonedRequest.clone({ 
                            headers: clonedRequest.headers.set('Authorization', `Bearer ${authToken}`) 
                        });
                    }
                    
                    return next(clonedRequest).pipe(
                        catchError((error: any) => {
                            if (error instanceof HttpErrorResponse) {
                                // Vérifier si JWT invalide (401 + JWT_ERROR)
                                if (error.status === 401 && error.error?.error === 'JWT_ERROR') {
                                    console.error('🔒 JWT invalide détecté, déconnexion...', {
                                        url: request.url,
                                        status: error.status
                                    });
                                    
                                    // Supprimer le token d'authentification
                                    return authService.logout().pipe(
                                        switchMap(() => throwError(() => error))
                                    );
                                }
                                
                                // Vérifier si l'erreur correspond à 'Missing X-Token header'
                                if (error.error?.error === 'UNAUTHORIZED' && 
                                    (error.error?.message === 'Missing X-Token header'|| error.error?.message === 'Invalid or expired token')) {
                                    console.error('🔒 Erreur détectée: Token X-Token manquant, retry...', {
                                        url: request.url,
                                        status: error.status
                                    });
                                    
                                    // Refaire getToken() et retry la requête
                                    return authService.authToken().pipe(
                                        switchMap(()=>{
                                            return authService.getToken()
                                        }),
                                        switchMap(newToken => {
                                            if(!newToken)
                                            {
                                                console.error("no token")
                                                return throwError(() => "no token")
                                            }
                                            return authService.getCurrentAuthToken().pipe(
                                                switchMap(newAuthToken => {
                                                    let retryRequest = request;
                                                    
                                                    // Ajouter le X-Token si disponible
                                                    if (newToken) {
                                                        retryRequest = retryRequest.clone({ 
                                                            headers: retryRequest.headers.set(tokenHeader, newToken) 
                                                        });
                                                    }
                                                    
                                                    // Ajouter le JWT si disponible
                                                    if (newAuthToken) {
                                                        retryRequest = retryRequest.clone({ 
                                                            headers: retryRequest.headers.set('Authorization', `Bearer ${newAuthToken}`) 
                                                        });
                                                    }
                                                    
                                                    return next(retryRequest);
                                                })
                                            );
                                        })
                                    );
                                }
                            }
                            return throwError(() => error);
                        })
                    );
                })
            );
        })
    );
};
