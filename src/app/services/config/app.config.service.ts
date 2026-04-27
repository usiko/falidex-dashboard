
import { ConfigService } from "./config.service";
import { Injectable } from "@angular/core";
import { IAppConfig } from "./model";
@Injectable({
    providedIn: 'root',
})
export class AppConfigService extends ConfigService<IAppConfig>{

}