import { Pipe, PipeTransform } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, of } from 'rxjs';

@Pipe({
  name: 'blobImage',
  pure: true
})
export class BlobImagePipe implements PipeTransform {

  private cache = new Map<string, string>();

  constructor(private http: HttpClient) {}

  transform(url: string): Observable<string> {
    if (!url) {
      return of('');
    }

    const cached = this.cache.get(url);
    if (cached) {
      return of(cached);
    }

    return this.http.get(url, { responseType: 'blob' }).pipe(
      map(blob => {
        const objectUrl = URL.createObjectURL(blob);
        this.cache.set(url, objectUrl);
        return objectUrl;
      })
    );
  }
}