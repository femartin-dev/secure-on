import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SettingsLayoutStateService {
  private readonly actionButtonsVisibleSubject = new BehaviorSubject<boolean>(true);

  readonly actionButtonsVisible$ = this.actionButtonsVisibleSubject.asObservable();

  setActionButtonsVisible(visible: boolean): void {
    this.actionButtonsVisibleSubject.next(visible);
  }

  resetActionButtonsVisibility(): void {
    this.actionButtonsVisibleSubject.next(true);
  }
}
