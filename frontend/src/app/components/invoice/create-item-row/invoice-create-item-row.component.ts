import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-invoice-create-item-row',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="mb-6 p-6 bg-white rounded-xl shadow-md border border-gray-200">
      <div class="flex items-center justify-between mb-4">
        <span class="text-lg font-bold text-gray-700">Item #{{ index + 1 }}</span>
        <button
          (click)="remove.emit()"
          type="button"
          [disabled]="!canRemove"
          class="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all"
          title="Remover item"
        >
          🗑️ Remover
        </button>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-2">
            Produto *
            @if (!item.productId && searchTerm) {
              <span class="text-xs font-normal text-gray-500">(buscando: "{{ searchTerm }}")</span>
            }
          </label>

          <div class="relative">
            <input
              [ngModel]="searchTerm"
              (ngModelChange)="searchChange.emit($event)"
              (focus)="focusSearch.emit()"
              type="text"
              placeholder="🔍 Digite para buscar produto..."
              class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />

            @if (dropdownVisible && (filteredProducts.length ?? 0) > 0) {
              <div class="absolute z-10 w-full mt-2 bg-white border-2 border-gray-300 rounded-lg shadow-2xl max-h-64 overflow-y-auto">
                @for (product of filteredProducts; track product.id) {
                  @if (isProductSelectedInOtherItem(product.id)) {
                    <div class="w-full px-4 py-3 text-left bg-gray-100 border-b border-gray-100 opacity-50 cursor-not-allowed">
                      <div class="font-bold text-gray-400 font-mono">{{ product.code }} 🚫</div>
                      <div class="text-sm text-gray-500">{{ product.description }}</div>
                      <div class="text-xs text-red-500 mt-1">
                        Já selecionado em outro item
                      </div>
                    </div>
                  } @else {
                    <button
                      (click)="selectProduct.emit(product)"
                      type="button"
                      class="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-gray-100 transition-colors"
                    >
                      <div class="font-bold text-blue-600 font-mono">{{ product.code }}</div>
                      <div class="text-sm text-gray-700">{{ product.description }}</div>
                      <div class="text-xs text-gray-500 mt-1">
                        Saldo: <span class="font-semibold text-blue-600">{{ product.balance }}</span> unidades
                      </div>
                    </button>
                  }
                }
              </div>
            }
          </div>

          @if (item.productId) {
            <div class="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div class="font-bold text-blue-700">✓ Produto Selecionado:</div>
              <div class="text-sm mt-1">
                <strong class="font-mono">{{ selectedProductCode }}</strong> - {{ selectedProductDescription }}
              </div>
              <div class="text-sm text-gray-600 mt-1">
                Saldo disponível: <span class="font-bold text-blue-600">{{ selectedProductBalance }}</span> unidades
              </div>
            </div>
          }
        </div>

        <div>
          <label class="block text-sm font-bold text-gray-700 mb-2">Quantidade *</label>
          <input
            [ngModel]="item.quantity"
            (ngModelChange)="quantityChange.emit(+$event)"
            type="number"
            min="1"
            [max]="selectedProductBalance"
            [disabled]="!item.productId"
            class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg disabled:bg-gray-100"
            placeholder="Digite a quantidade"
          />
        </div>
      </div>
    </div>
  `,
})
export class InvoiceCreateItemRowComponent {
  @Input() index = 0;
  @Input() item: { productId: string; quantity: number } = { productId: '', quantity: null as any };
  @Input() canRemove = false;
  @Input() searchTerm = '';
  @Input() dropdownVisible = false;
  @Input() filteredProducts: Product[] = [];
  @Input() selectedProductIds: string[] = [];
  @Input() selectedProductCode = '';
  @Input() selectedProductDescription = '';
  @Input() selectedProductBalance = 0;

  @Output() remove = new EventEmitter<void>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() focusSearch = new EventEmitter<void>();
  @Output() selectProduct = new EventEmitter<Product>();
  @Output() quantityChange = new EventEmitter<number>();

  isProductSelectedInOtherItem(productId: string): boolean {
    return this.selectedProductIds.includes(productId) && productId !== this.item.productId;
  }
}
