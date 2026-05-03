import { inject } from '@angular/core';
import { environment } from '../environments/environment';
import { AppConfigService } from './services/config/app.config.service';
import { StorageService } from './services/storage/storage.service';
import { mergeMap } from 'rxjs';


export const appInitiealizerFn = ()=>{
    const configService = inject(AppConfigService);
    const storageService = inject(StorageService);
    return configService
    .loadConfig(environment.configPaths).pipe(mergeMap(()=>{
        return storageService.loadAges()
    }))
}


