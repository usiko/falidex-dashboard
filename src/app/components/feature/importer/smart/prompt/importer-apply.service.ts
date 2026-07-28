import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppConfigService } from '../../../../../services/config/app.config.service';
import { environment } from '../../../../../../environments/environment';
import { ImportApplyRequest, ImportCode } from './import-batch.model';

interface ImportApplyResponse {
  success: boolean;
  code: ImportCode;
}

@Injectable({
  providedIn: 'root'
})
export class ImporterApplyService {
  private readonly http = inject(HttpClient);
  private readonly configService = inject(AppConfigService);

  apply(request: ImportApplyRequest): Observable<ImportCode> {
    return this.http
      .post<ImportApplyResponse>(`${environment.urls.dataServer}/${this.configService.getConfig()?.paths.import}`, request)
      .pipe(map((response) => response.code));
  }
}
