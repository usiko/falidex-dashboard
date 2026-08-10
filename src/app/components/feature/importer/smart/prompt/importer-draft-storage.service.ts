import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AppConfigService } from '../../../../../services/config/app.config.service';
import { environment } from '../../../../../../environments/environment';
import { ImporterDraft, ImporterDraftContent } from './importer-draft.model';

interface ImporterDraftResponse {
  savedAt: string;
  payload: ImporterDraftContent;
}

/**
 * Persiste le brouillon d'import côté serveur (associé à l'utilisateur connecté), pour pouvoir
 * reprendre un import en cours depuis un autre poste, ou l'annuler explicitement. Les erreurs
 * réseau sont avalées : la persistance du brouillon est un confort, elle ne doit jamais bloquer
 * la revue en cours.
 */
@Injectable({
  providedIn: 'root'
})
export class ImporterDraftStorageService {
  private readonly http = inject(HttpClient);
  private readonly configService = inject(AppConfigService);

  private get url(): string {
    return `${environment.urls.dataServer}/${this.configService.getConfig()?.paths.importDraft}`;
  }

  save(content: ImporterDraftContent): Observable<void> {
    return this.http.post<ImporterDraftResponse>(this.url, content).pipe(
      map(() => undefined),
      catchError((error) => {
        console.error("Erreur lors de la sauvegarde du brouillon d'import", error);
        return of(undefined);
      })
    );
  }

  load(): Observable<ImporterDraft | null> {
    return this.http.get<ImporterDraftResponse | null>(this.url).pipe(
      map((response) => (response ? { savedAt: response.savedAt, payload: response.payload } : null)),
      catchError((error) => {
        console.error("Erreur lors de la récupération du brouillon d'import", error);
        return of(null);
      })
    );
  }

  clear(): Observable<void> {
    return this.http.delete<void>(this.url).pipe(
      map(() => undefined),
      catchError((error) => {
        console.error("Erreur lors de la suppression du brouillon d'import", error);
        return of(undefined);
      })
    );
  }
}
