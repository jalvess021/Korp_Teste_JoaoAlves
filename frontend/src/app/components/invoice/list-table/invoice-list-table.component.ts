import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Invoice } from '../../../models/invoice.model';

@Component({
  selector: 'app-invoice-list-table',
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-100">
          <tr>
            <th class="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Número</th>
            <th class="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
            <th class="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Data Criação</th>
            <th class="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Itens</th>
            <th class="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Ações</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          @for (invoice of paginatedInvoices; track invoice.id) {
            <tr class="hover:bg-blue-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="font-bold text-blue-600 font-mono text-lg">#{{ invoice.number }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                @if (invoice.status === 'OPEN') {
                  <span class="px-4 py-2 rounded-full text-sm font-bold bg-blue-100 text-blue-800">Aberta</span>
                } @else {
                  <span class="px-4 py-2 rounded-full text-sm font-bold bg-gray-100 text-gray-800">Fechada</span>
                }
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-700">
                {{ invoice.createdAt | date:'dd/MM/yyyy HH:mm' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg font-bold">
                  {{ invoice.items.length }} {{ invoice.items.length === 1 ? 'item' : 'itens' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <a
                  [routerLink]="['/invoices', invoice.id]"
                  class="text-blue-600 hover:text-blue-800 font-semibold"
                >
                  Ver detalhes →
                </a>
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
            Mostrando {{ startRecord() }} -
            {{ endRecord() }}
            de <strong>{{ filteredTotal }}</strong> notas
          </span>
        </div>

        @if (totalPages > 1) {
          <div class="flex gap-2">
            <button
              (click)="goToPage.emit(currentPage - 1)"
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
              (click)="goToPage.emit(currentPage + 1)"
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
export class InvoiceListTableComponent {
  @Input() paginatedInvoices: Invoice[] = [];
  @Input() currentPage = 1;
  @Input() pageSize = 10;
  @Input() pageSizeOptions: number[] = [];
  @Input() totalPages = 1;
  @Input() pageNumbers: number[] = [];
  @Input() filteredTotal = 0;

  @Output() pageSizeChange = new EventEmitter<number>();
  @Output() goToPage = new EventEmitter<number>();

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
