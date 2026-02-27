import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-product-list-table',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-100">
          <tr>
            <th class="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                (click)="toggleSort.emit('code')">
              Código
              @if (sortBy === 'code') {
                <span class="ml-1">{{ sortDirection === 'asc' ? '↑' : '↓' }}</span>
              }
            </th>
            <th class="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                (click)="toggleSort.emit('description')">
              Descrição
              @if (sortBy === 'description') {
                <span class="ml-1">{{ sortDirection === 'asc' ? '↑' : '↓' }}</span>
              }
            </th>
            <th class="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                (click)="toggleSort.emit('balance')">
              Saldo
              @if (sortBy === 'balance') {
                <span class="ml-1">{{ sortDirection === 'asc' ? '↑' : '↓' }}</span>
              }
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          @for (product of paginatedProducts; track product.id) {
            <tr class="hover:bg-blue-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="font-bold text-blue-600 font-mono text-lg">{{ product.code }}</span>
              </td>
              <td class="px-6 py-4 text-gray-700">{{ product.description }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                @if (product.balance > 10) {
                  <span class="px-4 py-2 rounded-full text-sm font-bold bg-green-100 text-green-800">
                    ✓ {{ product.balance }} un.
                  </span>
                } @else if (product.balance > 0) {
                  <span class="px-4 py-2 rounded-full text-sm font-bold bg-yellow-100 text-yellow-800">
                    ⚠ {{ product.balance }} un.
                  </span>
                } @else {
                  <span class="px-4 py-2 rounded-full text-sm font-bold bg-red-100 text-red-800">
                    ✗ Esgotado
                  </span>
                }
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>

    <div class="px-6 py-4 bg-gray-50 border-t border-gray-200">
      <div class="flex flex-col md:flex-row justify-between items-center gap-4">
        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-600 font-semibold">Registros por página:</span>
          <select
            [ngModel]="pageSize"
            (ngModelChange)="pageSizeChange.emit(+$event)"
            class="px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
          >
            @for (size of pageSizeOptions; track size) {
              <option [value]="size">{{ size }}</option>
            }
          </select>
          <span class="text-sm text-gray-600">
            Mostrando {{ startRecord() }} - {{ endRecord() }}
            de <strong>{{ filteredTotal }}</strong> produtos
          </span>
        </div>

        @if (totalPages > 1) {
          <div class="flex gap-2">
            <button
              (click)="previousPage.emit()"
              [disabled]="currentPage === 1"
              class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all"
            >
              ← Anterior
            </button>

            @for (page of pageNumbers; track page) {
              <button
                (click)="goToPage.emit(page)"
                [class.bg-blue-600]="page === currentPage"
                [class.text-white]="page === currentPage"
                [class.hover:bg-blue-700]="page === currentPage"
                [class.hover:bg-gray-100]="page !== currentPage"
                class="px-4 py-2 border border-gray-300 rounded-lg font-semibold transition-all"
              >
                {{ page }}
              </button>
            }

            <button
              (click)="nextPage.emit()"
              [disabled]="currentPage === totalPages"
              class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all"
            >
              Próxima →
            </button>
          </div>
        }
      </div>
    </div>
  `,
})
export class ProductListTableComponent {
  @Input() paginatedProducts: Product[] = [];
  @Input() sortBy = 'code';
  @Input() sortDirection: 'asc' | 'desc' = 'asc';
  @Input() currentPage = 1;
  @Input() pageSize = 10;
  @Input() pageSizeOptions: number[] = [];
  @Input() totalPages = 1;
  @Input() pageNumbers: number[] = [];
  @Input() filteredTotal = 0;

  @Output() toggleSort = new EventEmitter<string>();
  @Output() previousPage = new EventEmitter<void>();
  @Output() nextPage = new EventEmitter<void>();
  @Output() goToPage = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  startRecord(): number {
    if (this.filteredTotal === 0) {
      return 0;
    }

    return (this.currentPage - 1) * this.pageSize + 1;
  }

  endRecord(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredTotal);
  }
}
