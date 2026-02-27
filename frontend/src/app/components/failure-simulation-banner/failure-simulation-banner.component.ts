import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FailureSimulationService } from '../../services/failure-simulation.service';

@Component({
  selector: 'app-failure-simulation-banner',
  imports: [CommonModule],
  template: `
    <section class="max-w-7xl mx-auto px-4 mb-6">
      <div class="bg-linear-to-r from-blue-50 to-gray-50 border border-blue-200 rounded-2xl p-5 shadow-sm">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div class="space-y-1">
            <h2 class="text-lg font-bold text-blue-700">Simulação de Falha de Microserviço</h2>
            <p class="text-sm text-gray-700">
              Este controle <strong>simula indisponibilidade do serviço de estoque</strong> e se aplica no fluxo de
              <strong>impressão da nota fiscal</strong>.
            </p>
          </div>

          <div class="flex items-center gap-3">
            <span class="text-sm font-semibold text-gray-700">Estado</span>
            <button
              type="button"
              (click)="failureSimulation.toggle()"
              [attr.aria-pressed]="failureSimulation.selected()"
              class="relative inline-flex h-8 w-16 items-center rounded-full transition-colors"
              [class.bg-blue-600]="failureSimulation.selected()"
              [class.bg-gray-300]="!failureSimulation.selected()"
            >
              <span
                class="inline-block h-6 w-6 transform rounded-full bg-white transition-transform"
                [class.translate-x-9]="failureSimulation.selected()"
                [class.translate-x-1]="!failureSimulation.selected()"
              ></span>
            </button>
            <span class="text-sm font-bold" [class.text-blue-600]="failureSimulation.selected()" [class.text-gray-500]="!failureSimulation.selected()">
              {{ failureSimulation.selected() ? 'ON' : 'OFF' }}
            </span>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class FailureSimulationBannerComponent {
  failureSimulation = inject(FailureSimulationService);
}
