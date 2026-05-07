import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { from, Observable, of, throwError, timer } from 'rxjs';
import { catchError, map, mergeMap, retry, switchMap, tap } from 'rxjs/operators';
import { AppConfigService } from '../config/app.config.service';
import { StorageService } from '../storage/storage.service';
import { environment } from '../../../environments/environment';
import { CurrentUserStore } from '../../stores/current-user/current-user.store';
import { IUser } from '../../models/user.model';


@Injectable({
    providedIn: 'root',
})
export class AuthService {

    private http= inject(HttpClient);
    private configService= inject(AppConfigService);
    private storageService= inject(StorageService);
    private currentUserStore = inject(CurrentUserStore);

    login(user_name:string,password:string) {
        const url = this.configService.getConfig()?.urls?.dataServer;
        return this.http
            .post<{ token: string; user?: IUser }>(`${url}/${this.configService.getConfig()?.paths.login}`, {
                user_name,
                password,
            })
            .pipe(
                tap((data) => {
                    let user: IUser;
                    // Si l'API retourne l'utilisateur, on l'utilise
                    if (data.user) {
                        user = data.user;
                    } else {
                        // Sinon, on crée un utilisateur avec le username fourni
                        // TODO: Décoder le JWT pour extraire l'ID et le username
                        user = {
                            id: '', // Sera rempli par décodage du token ou appel API
                            username: user_name
                        };
                    }
                    
                    // Stocker le token avec les infos utilisateur
                    this.setAuthToken(data.token, user);
                    
                    // Mettre à jour le store
                    this.currentUserStore.setUser(user);
                }),
                catchError((error) => {
                    this.setAuthToken(undefined);
                    this.currentUserStore.clearUser();
                    return throwError(()=>error);
                })
            );
    }

    private setToken(token: string|undefined):void {
        
       if(token)
       {
        const data = {
            value:token,
            date:new Date()
        }
        this.storageService.set("token",data,"date").subscribe()
       }
       else{
        this.storageService.remove("token").subscribe()
       }
    }
    private setAuthToken(token: string|undefined, user?: IUser):void {
        
       if(token && user)
       {
        const data = {
            value: token,
            date: new Date(),
            user: {
                id: user.id,
                username: user.username
            }
        }
        this.storageService.set("auth-token",data,"date").subscribe()
       }
       else{
        this.storageService.remove("auth-token").subscribe()
       }
    }


    /**
     * Récupère l'utilisateur depuis le storage auth-token
     */
    private getCurrentUser(): Observable<IUser|undefined> {
       return this.storageService.get("auth-token",undefined,'date', 23 * 60 * 60 * 1000).pipe(
         map((data:{value:string, date:Date, user: IUser}|undefined) => data?.user)
       );
    }

    getToken(): Observable<string|undefined> {
       return this.storageService.get("token",undefined,'date', 23 * 60 * 60 * 1000).pipe(
         switchMap((data:{value:string,date:Date}|undefined)=>{
           const token = data?.value;
           // Si on a un token, on le retourne
           if(token) {
             return of(token);
           }
           // Sinon, on fait authToken() puis on retourne le nouveau token
           return this.authToken().pipe(
             switchMap(() => this.storageService.get("token",undefined,'date', 23 * 60 * 60 * 1000)),
             map((newData:{value:string,date:Date}|undefined) => newData?.value)
           );
         })
       )
    }
    getCurrentAuthToken(): Observable<string|undefined> {
       return this.storageService.get("auth-token",undefined,'date', 23 * 60 * 60 * 1000).pipe(
         switchMap((data:{value:string,date:Date}|undefined)=>{
            // Si le token est absent ou expiré, nettoyer le store et currentUserStore
            if (!data?.value) {
                this.storageService.remove("auth-token").subscribe();
                this.currentUserStore.clearUser();
            }
            return of(data?.value);
         })

       )
    }

    authToken()
    {
        const url = this.configService.getConfig()?.urls?.dataServer;
        const tokenPath = this.configService.getConfig()?.paths.token;
        if(url && tokenPath)
        {
        const fullUrl =  `${url}/${tokenPath}`;
        const role = 'visitor';
        const timestamp = Math.floor(Date.now()/1000)-1;
        return from(this.getHashToken(role,timestamp)).pipe(mergeMap((hash:string)=>{
                    return this.http.post<{token:string}>(fullUrl,{role,timestamp,hash}).pipe(
            mergeMap((result)=>{
                return from(this.getHashDerivationToken(result.token))
            }),
            tap((derivatedToken)=>{
                this.setToken(derivatedToken);
            }),
            retry({
                count: 3,
                delay: (error, retryCount) => {
                    // Vérifier si c'est l'erreur spécifique "Invalid or expired token"
                    if (error instanceof HttpErrorResponse && 
                        error.error?.error === 'UNAUTHORIZED' && 
                        error.error?.message === 'Invalid or expired token') {
                        console.log(`⚠️ Token invalide ou expiré, tentative ${retryCount}/3...`);
                        // Attendre 1 seconde avant de réessayer
                        return timer(1000);
                    }
                    // Si ce n'est pas l'erreur attendue, propager l'erreur immédiatement
                    return throwError(() => error);
                }
            }),
            catchError((error) => {
                console.error('❌ Échec définitif de authToken après plusieurs tentatives', error,fullUrl);
                return throwError(() => error);
            }),
            map(()=>{
                return void 0;
            })
        );
        }))

        }
        else{
            return throwError(()=>'no url')
        }

    }

    /**
     * Récupère la clé secrète pour le hash du token depuis les variables d'environnement
     */
    private getTokenHashKey(): string {
       // Récupérer depuis process.env avec un fallback
       return environment.tokenKey??'default_dev_token_hash_please_change'
    }
    private getDerivationTokenHashKey(): string {
       // Récupérer depuis process.env avec un fallback
       return environment.derivationTokenKey??'default_dev_token_hash_please_change'
    }

    /**
     * Génère un hash SHA256 identique à celui du serveur
     * Format: SHA256(role|secret|timestamp)
     */
    async getHashToken(role: string, timestamp: number): Promise<string> {
        const secret = this.getTokenHashKey();
        const data = `${role}|${secret}|${timestamp}`;
        
        // Encoder la chaîne en bytes
        const encoder = new TextEncoder();
        const dataBytes = encoder.encode(data);
        
        // Calculer le hash SHA256
        const hashBuffer = await crypto.subtle.digest('SHA-256', dataBytes);
        
        // Convertir le buffer en string hexadécimal
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        return hashHex;
    }

    async getHashDerivationToken(token:string)
    {
        const secret = this.getDerivationTokenHashKey()
        const data = `${token}|${secret}`;
        
        // Encoder la chaîne en bytes
        const encoder = new TextEncoder();
        const dataBytes = encoder.encode(data);
        
        // Calculer le hash SHA256
        const hashBuffer = await crypto.subtle.digest('SHA-256', dataBytes);
        
        // Convertir le buffer en string hexadécimal
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        return hashHex;
    }

    /**
     * Vérifie si l'utilisateur est authentifié
     * Retourne true si un token d'authentification valide existe
     * Nettoie le store si le token n'est pas valide
     */
    isAuth(): Observable<boolean> {
        return this.getCurrentAuthToken().pipe(
            map(token => {
                const isAuthenticated = !!token;
                // Si pas de token valide, nettoyer le store utilisateur
                if (!isAuthenticated) {
                    this.currentUserStore.clearUser();
                }
                return isAuthenticated;
            })
        );
    }

    /**
     * Initialise l'utilisateur depuis le storage au démarrage de l'application
     * Si un token existe, restaure l'utilisateur
     */
    initializeUser(): Observable<void> {
        return this.getCurrentAuthToken().pipe(
            switchMap(token => {
                if (token) {
                    // Si un token existe, charger l'utilisateur depuis le storage
                    return this.getCurrentUser().pipe(
                        tap(user => {
                            if (user) {
                                this.currentUserStore.setUser(user);
                            }
                        }),
                        map(() => void 0)
                    );
                } else {
                    // Pas de token, s'assurer que le store est vide
                    this.currentUserStore.clearUser();
                    return of(void 0);
                }
            })
        );
    }

    /**
     * Déconnecte l'utilisateur en supprimant le token d'authentification et en vidant le store
     */
    logout(): Observable<void> {
        this.setAuthToken(undefined);
        this.currentUserStore.clearUser();
        return of(void 0);
    }
}
