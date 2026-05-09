import { Injectable } from '@angular/core';
import { AppConfigService } from '../config/app.config.service';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class PictureService {
    constructor(private config: AppConfigService) {}
    getFullResourceUrl(src: string) {
        if (src && src[0] == '/') {
            src = src.slice(1);
        }
        const config = this.config.getConfig()
        if (config) {
            const baseUrl = environment.urls.pictureServer;
            const salt = config.pictureServerSalt;
            if (baseUrl && src) {
                if (salt) {
                    return `${baseUrl}?getPicture=${src}&littleSalty=${salt}`;
                } else {
                    return `${baseUrl}?getPicture?=${src}`;
                }
            } else {
                return undefined;
            }
        } else {
            return undefined;
        }
    }
}
