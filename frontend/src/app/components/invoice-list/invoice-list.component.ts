import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Invoice } from '../../models/invoice.model';
import { InvoiceService } from '../../services/invoice.service';

@Component({
  selector: 'app-invoice-list',
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 class="text-4xl font-bold text-gray-900 flex items-center gap-3">
          <span class="text-blue-600">🧾</span>
          Notas Fiscais
        </h1>
        <a
          routerLink="/invoices/create"
          class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-bold transition-colors shadow-md"
        >
          + Nova Nota Fiscal
        </a>
      </div>

      @if (loading()) {
        <div class="bg-white shadow-xl rounded-2xl p-8 text-center border border-gray-200">
          <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p class="mt-6 text-gray-500 font-semibold text-lg">Carregando notas fiscais...</p>
        </div>
      } @else if (invoices().length === 0) {
        <div class="bg-white shadow-xl rounded-2xl p-12 text-center border border-gray-200">
          <div class="text-6xl mb-4">📄</div>
          <p class="text-gray-600 text-lg mb-6">Nenhuma nota fiscal cadastrada ainda.</p>
          <a
            routerLink="/invoices/create"
            class="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
          >
            Criar primeira nota fiscal →
          </a>
        </div>
      } @else {
        <div class="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200">
          <div class="px-8 py-6 bg-linear-to-r from-gray-50 to-blue-50 border-b border-gray-200">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 class="text-2xl font-bold text-gray-800">📋 Notas Cadastradas</h2>

              <div class="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                <input
                  type="text"
                  [(ngModel)]="searchTerm"
                  (ngModelChange)="onFiltersChange()"
                  placeholder="Buscar por número..."
                  class="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
                />

                <select
                  [(ngModel)]="statusFilter"
                  (ngModelChange)="onFiltersChange()"
                  class="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Status: Todos</option>
                  <option value="OPEN">Status: Abertas</option>
                  <option value="CLOSED">Status: Fechadas</option>
                </select>

                <select
                  [(ngModel)]="sortOrder"
                  (ngModelChange)="onFiltersChange()"
                  class="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="desc">Ordem: Mais recentes</option>
                  <option value="asc">Ordem: Mais antigas</option>
                </select>
              </div>
            </div>
          </div>

          @if (filteredInvoices().length === 0) {
            <div class="p-12 text-center">
              <div class="text-6xl mb-4">🔍</div>
              <p class="text-gray-500 text-lg">Nenhuma nota fiscal encontrada com os filtros atuais.</p>
              <button
                (click)="clearFilters()"
                class="mt-4 text-blue-600 hover:text-blue-800 font-semibold"
              >
                Limpar filtros
              </button>
            </div>
          } @else {
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
                  @for (invoice of paginatedInvoices(); track invoice.id) {
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
                    [(ngModel)]="pageSize"
                    (ngModelChange)="onPageSizeChange()"
                    class="px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                  >
                    @for (size of pageSizeOptions; track size) {
                      <option [value]="size">{{ size }}</option>
                    }
                  </select>
                  <span class="text-sm text-gray-600">
                    Mostrando {{ (currentPage() - 1) * pageSize() + 1 }} -
                    {{ Math.min(currentPage() * pageSize(), filteredInvoices().length) }}
                    de <strong>{{ filteredInvoices().length }}</strong> notas
                  </span>
                </div>

                @if (totalPages() > 1) {
                  <div class="flex gap-2">
                    <button
                      (click)="goToPage(currentPage() - 1)"
                      [disabled]="currentPage() === 1"
                      class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all"
                    >
                      ← Anterior
                    </button>

                    @for (page of getPageNumbers(); track page) {
                      <button
                        (click)="goToPage(page)"
                        [class.bg-blue-600]="page === currentPage()"
                        [class.text-white]="page === currentPage()"
                        [class.hover:bg-blue-700]="page === currentPage()"
                        [class.hover:bg-gray-100]="page !== currentPage()"
                        class="px-4 py-2 border border-gray-300 rounded-lg font-semibold transition-all"
                      >
                        {{ page }}
                      </button>
                    }

                    <button
                      (click)="goToPage(currentPage() + 1)"
                      [disabled]="currentPage() === totalPages()"
                      class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all"
                    >
                      Próxima →
                    </button>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class InvoiceListComponent implements OnInit {
  private invoiceService = inject(InvoiceService);

  invoices = signal<Invoice[]>([]);
  loading = signal(true);

  searchTerm = signal('');
  statusFilter = signal('');
  sortOrder = signal<'asc' | 'desc'>('desc');

  currentPage = signal(1);
  pageSize = signal(10);
  pageSizeOptions = [10, 25, 50, 100];

  Math = Math;

  ngOnInit() {
    this.loadInvoices();
  }

  loadInvoices() {
    this.loading.set(true);
    this.invoiceService.getInvoices().subscribe({
      next: (invoices) => {
        this.invoices.set(invoices);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar notas:', err);
        this.loading.set(false);
      },
    });
  }

  filteredInvoices = computed(() => {
    let filtered = this.invoices();

    const search = this.searchTerm().trim().toLowerCase();
    if (search) {
      filtered = filtered.filter((inv) => inv.number.toString().includes(search));
    }

    const status = this.statusFilter();
    if (status) {
      filtered = filtered.filter((inv) => inv.status === status);
    }

    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return this.sortOrder() === 'desc' ? dateB - dateA : dateA - dateB;
    });
  });

  totalPages = computed(() => Math.ceil(this.filteredInvoices().length / this.pageSize()));

  paginatedInvoices = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return this.filteredInvoices().slice(start, end);
  });

  onFiltersChange() {
    this.currentPage.set(1);
  }

  clearFilters() {
    this.searchTerm.set('');
    this.statusFilter.set('');
    this.sortOrder.set('desc');
    this.currentPage.set(1);
  }

  onPageSizeChange() {
    this.currentPage.set(1);
  }

  goToPage(page: number) {
    if (page > 0 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  getPageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
      return pages;
    }

    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push(total);
      return pages;
    }

    if (current >= total - 3) {
      pages.push(1);
      for (let i = total - 4; i <= total; i++) pages.push(i);
      return pages;
    }

    pages.push(1);
    for (let i = current - 1; i <= current + 1; i++) pages.push(i);
    pages.push(total);
    return pages;
  }
}
