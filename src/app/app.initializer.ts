import { inject } from '@angular/core';
import { environment } from '../environments/environment';
import { AppConfigService } from './services/config/app.config.service';


export const appInitiealizerFn = ()=>{
    const configService = inject(AppConfigService);
    return configService
    .loadConfig(environment.configPaths);
}


