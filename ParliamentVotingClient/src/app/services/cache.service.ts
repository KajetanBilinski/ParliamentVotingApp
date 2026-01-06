import { Injectable } from '@angular/core';
import { Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CacheService {
  private cache = new Map<string, any>();

  constructor() {
    this.loadFromLocalStorage();
  }

  get<T>(
    key: string,
    fetchFn: () => Observable<T>,
    useLocalStorage: boolean = true
  ): Observable<T> {
    const cached = this.cache.get(key);

    if (cached !== undefined) {
      console.log(`[Cache] Hit for key: ${key}`);
      return of(cached as T);
    }

    console.log(`[Cache] Miss for key: ${key}, fetching from API...`);
    return fetchFn().pipe(
      tap((data) => {
        this.set(key, data, useLocalStorage);
      })
    );
  }

  set<T>(key: string, data: T, useLocalStorage: boolean = true): void {
    this.cache.set(key, data);

    if (useLocalStorage) {
      try {
        localStorage.setItem(`cache_${key}`, JSON.stringify(data));
      } catch (error) {
        console.error('[Cache] Error saving to localStorage:', error);
      }
    }
  }

  remove(key: string): void {
    this.cache.delete(key);
    localStorage.removeItem(`cache_${key}`);
  }

  clear(): void {
    this.cache.clear();
    Object.keys(localStorage)
      .filter((key) => key.startsWith('cache_'))
      .forEach((key) => localStorage.removeItem(key));
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  private loadFromLocalStorage(): void {
    Object.keys(localStorage)
      .filter((key) => key.startsWith('cache_'))
      .forEach((key) => {
        try {
          const data = JSON.parse(localStorage.getItem(key)!);
          const cacheKey = key.replace('cache_', '');
          this.cache.set(cacheKey, data);
        } catch (error) {
          console.error(`[Cache] Error loading ${key} from localStorage:`, error);
        }
      });
  }

  refresh<T>(
    key: string,
    fetchFn: () => Observable<T>,
    useLocalStorage: boolean = true
  ): Observable<T> {
    this.remove(key);
    return fetchFn().pipe(
      tap((data) => {
        this.set(key, data, useLocalStorage);
      })
    );
  }
}
