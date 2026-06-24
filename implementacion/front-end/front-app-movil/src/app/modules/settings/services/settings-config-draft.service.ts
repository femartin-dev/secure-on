import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { filter, take, tap } from 'rxjs/operators';
import { AppSettings } from '@app/models/config.models';
import { ConfigService } from '@app/services/config.service';

type InitState = 'idle' | 'loading' | 'ready';

const DRAFT_STORAGE_KEY = 'app_settings_draft';

@Injectable({ providedIn: 'root' })
export class SettingsConfigDraftService {
  private initState: InitState = 'idle';
  private initialSnapshot: AppSettings | null = null;
  private readonly draftSubject = new BehaviorSubject<AppSettings | null>(null);

  readonly draft$ = this.draftSubject.asObservable();

  constructor(private configService: ConfigService) {}

  ensureInitialized(): void {
    if (this.initState === 'ready' || this.initState === 'loading') {
      return;
    }

    // Try to recover draft from sessionStorage first
    const savedDraft = this.loadDraftFromStorage();
    if (savedDraft) {
      this.draftSubject.next(savedDraft);
      this.initialSnapshot = this.loadInitialSnapshotFromStorage() || this.cloneSettings(savedDraft);
      this.initState = 'ready';
      return;
    }

    const current = this.configService.getCurrentConfig();
    if (current) {
      this.setSnapshots(current);
      this.initState = 'ready';
      return;
    }

    this.initState = 'loading';
    this.configService.config$
      .pipe(
        tap((config) => console.log('config:', config)),
        filter((config): config is AppSettings => config !== null),
        take(1)
      )
      .subscribe((config) => {
        this.setSnapshots(config);
        this.initState = 'ready';
      });
  }

  updateSection<K extends keyof AppSettings>(
    section: K,
    patch: Partial<AppSettings[K]>
  ): void {
    const draft = this.draftSubject.value;
    if (!draft) {
      return;
    }

    const updated = {
      ...draft,
      [section]: { ...(draft[section] as object), ...patch },
    } as AppSettings;

    this.draftSubject.next(updated);
    this.persistDraftToStorage(updated);
  }

  resetToInitial(): void {
    if (!this.initialSnapshot) {
      return;
    }

    this.draftSubject.next(this.cloneSettings(this.initialSnapshot));
    this.persistDraftToStorage(this.initialSnapshot);
  }

  saveAll(): Observable<AppSettings> {
    const draft = this.draftSubject.value;
    console.log('Saving config draft:', draft);
    if (!draft) {
      return throwError(() => new Error('No hay configuración para guardar'));
    }

    return this.configService.updateConfig(draft).pipe(
      tap((saved) => {
        this.setSnapshots(saved);
        this.clearDraftFromStorage();
      })
    );
  }

  private setSnapshots(config: AppSettings): void {
    this.initialSnapshot = this.cloneSettings(config);
    this.draftSubject.next(this.cloneSettings(config));
  }

  private cloneSettings(config: AppSettings): AppSettings {
    return JSON.parse(JSON.stringify(config)) as AppSettings;
  }

  private persistDraftToStorage(draft: AppSettings): void {
    try {
      sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch (error) {
      console.warn('Error persisting draft to storage:', error);
    }
  }

  private loadDraftFromStorage(): AppSettings | null {
    try {
      const stored = sessionStorage.getItem(DRAFT_STORAGE_KEY);
      return stored ? JSON.parse(stored) as AppSettings : null;
    } catch (error) {
      console.warn('Error loading draft from storage:', error);
      return null;
    }
  }

  private loadInitialSnapshotFromStorage(): AppSettings | null {
    try {
      const stored = sessionStorage.getItem(DRAFT_STORAGE_KEY + '_initial');
      return stored ? JSON.parse(stored) as AppSettings : null;
    } catch (error) {
      console.warn('Error loading initial snapshot from storage:', error);
      return null;
    }
  }

  private clearDraftFromStorage(): void {
    try {
      sessionStorage.removeItem(DRAFT_STORAGE_KEY);
      sessionStorage.removeItem(DRAFT_STORAGE_KEY + '_initial');
    } catch (error) {
      console.warn('Error clearing draft from storage:', error);
    }
  }
}
