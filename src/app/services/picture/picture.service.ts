import { Injectable } from '@angular/core';
import { AppConfigService } from '../config/app.config.service';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class PictureService {
    constructor(private config: AppConfigService) {}
    getFullResourceUrl(src: string) {
        return `http://localhost:3000${src}`;
    }
}
