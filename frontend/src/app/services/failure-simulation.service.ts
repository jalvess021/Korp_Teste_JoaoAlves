import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FailureSimulationService {
  selected = signal(false);

  toggle() {
    this.selected.update((current) => !current);
  }
}
