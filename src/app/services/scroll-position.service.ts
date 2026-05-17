import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScrollPositionService {
  private scrollPositions = new Map<string, number>();

  constructor() {
    this.loadFromSessionStorage();
  }

  saveScrollPosition(key: string, scrollTop: number): void {
    this.scrollPositions.set(key, scrollTop);
    sessionStorage.setItem(`scroll_${key}`, scrollTop.toString());
  }

  getScrollPosition(key: string): number | undefined {
    return this.scrollPositions.get(key);
  }

  loadFromSessionStorage(): void {
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.startsWith('scroll_')) {
        const scrollKey = key.replace('scroll_', '');
        const scrollTop = parseInt(sessionStorage.getItem(key) || '0', 10);
        this.scrollPositions.set(scrollKey, scrollTop);
      }
    });
  }

  clearScrollPosition(key: string): void {
    this.scrollPositions.delete(key);
    sessionStorage.removeItem(`scroll_${key}`);
  }

  clearAllScrollPositions(): void {
    this.scrollPositions.clear();
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('scroll_')) {
        sessionStorage.removeItem(key);
      }
    });
  }
}
