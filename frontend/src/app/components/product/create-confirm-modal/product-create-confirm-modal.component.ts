import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CreateProductRequest } from '../../../models/product.model';

@Component({
  selector: 'app-product-create-confirm-modal',
  imports: [CommonModule],
  template: `
    @if (visible) {
      <div class="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
        <div class="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl animate-[scale-up_0.2s_ease-out]">
          <div class="text-center mb-6">
            <div class="text-6xl mb-4">⏱️</div>
            <h3 class="text-2xl font-bold text-gray-900 mb-2">Confirmar Cadastro</h3>
            <p class="text-gray-600 mb-4">Deseja cadastrar este produto?</p>
            <div class="text-5xl font-bold text-blue-600 mb-2">{{ countdown }}</div>
            <p class="text-sm text-gray-500">segundos para cancelar</p>
          </div>

          <div class="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <p class="text-sm text-gray-700"><strong>Código:</strong> {{ product.code }}</p>
            <p class="text-sm text-gray-700"><strong>Descrição:</strong> {{ product.description }}</p>
            <p class="text-sm text-gray-700"><strong>Saldo:</strong> {{ product.balance }}</p>
          </div>

          <div class="flex gap-3">
            <button
              (click)="confirm.emit()"
              class="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 font-semibold transition-all transform hover:scale-105"
            >
              ✓ Confirmar
            </button>
            <button
              (click)="cancel.emit()"
              class="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 font-semibold transition-all transform hover:scale-105"
            >
              ✗ Cancelar
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ProductCreateConfirmModalComponent {
  @Input() visible = false;
  @Input() countdown = 5;
  @Input() product: CreateProductRequest = { code: '', description: '', balance: null as any };

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}
