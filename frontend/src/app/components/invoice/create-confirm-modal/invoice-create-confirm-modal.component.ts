import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export type InvoicePendingDisplayItem = {
  code: string;
  description: string;
  quantity: number;
};

@Component({
  selector: 'app-invoice-create-confirm-modal',
  imports: [CommonModule],
  template: `
    @if (visible) {
      <div class="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
        <div class="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl animate-[scale-up_0.2s_ease-out]">
          <div class="text-center mb-6">
            <div class="text-6xl mb-4">⏱️</div>
            <h3 class="text-2xl font-bold text-gray-900 mb-2">Confirmar Criação da Nota</h3>
            <p class="text-gray-600 mb-4">Revise os itens antes de confirmar</p>
            <div class="text-5xl font-bold text-blue-600 mb-2">{{ countdown }}</div>
            <p class="text-sm text-gray-500">segundos para cancelar</p>
          </div>

          <div class="bg-gray-50 rounded-lg p-6 mb-6 text-left max-h-96 overflow-y-auto">
            <h4 class="font-bold mb-3 text-lg">Itens da Nota:</h4>
            @for (item of items; track $index) {
              <div class="bg-white p-3 rounded-lg mb-2 border border-gray-200">
                <p class="text-sm">
                  <strong class="text-blue-600">{{ item.code }}</strong> -
                  {{ item.description }}
                </p>
                <p class="text-sm text-gray-600 mt-1">
                  Quantidade: <strong>{{ item.quantity }}</strong> unidades
                </p>
              </div>
            }
            <div class="mt-4 pt-4 border-t border-gray-300">
              <p class="font-bold text-lg">Total de itens: {{ items.length }}</p>
            </div>
          </div>

          <div class="flex gap-3">
            <button
              (click)="confirm.emit()"
              class="flex-1 bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 font-bold text-lg transition-all transform hover:scale-105"
            >
              ✓ Confirmar e Criar
            </button>
            <button
              (click)="cancel.emit()"
              class="flex-1 bg-red-600 text-white py-4 px-6 rounded-lg hover:bg-red-700 font-bold text-lg transition-all transform hover:scale-105"
            >
              ✗ Cancelar
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class InvoiceCreateConfirmModalComponent {
  @Input() visible = false;
  @Input() countdown = 5;
  @Input() items: InvoicePendingDisplayItem[] = [];

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}
