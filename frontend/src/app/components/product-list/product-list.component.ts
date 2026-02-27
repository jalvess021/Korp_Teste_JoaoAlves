import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { Product, CreateProductRequest } from '../../models/product.model';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8">
      <h1 class="text-4xl font-bold text-gray-900 mb-8 flex items-center gap-3">
        <span class="text-blue-600">📦</span>
        Gerenciamento de Produtos
      </h1>

      <!-- Formulário de Cadastro -->
      <div class="bg-linear-to-br from-white to-blue-50 shadow-xl rounded-2xl p-8 mb-8 border border-blue-100">
        <h2 class="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
          <span class="text-green-600">➕</span>
          Cadastrar Novo Produto
        </h2>
        
        @if (showConfirmModal()) {
          <div class="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
            <div class="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl animate-[scale-up_0.2s_ease-out]">
              <div class="text-center mb-6">
                <div class="text-6xl mb-4">⏱️</div>
                <h3 class="text-2xl font-bold text-gray-900 mb-2">Confirmar Cadastro</h3>
                <p class="text-gray-600 mb-4">Deseja cadastrar este produto?</p>
                <div class="text-5xl font-bold text-blue-600 mb-2">{{ countdown() }}</div>
                <p class="text-sm text-gray-500">segundos para cancelar</p>
              </div>
              
              <div class="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <p class="text-sm text-gray-700"><strong>Código:</strong> {{ pendingProduct.code }}</p>
                <p class="text-sm text-gray-700"><strong>Descrição:</strong> {{ pendingProduct.description }}</p>
                <p class="text-sm text-gray-700"><strong>Saldo:</strong> {{ pendingProduct.balance }}</p>
              </div>
              
              <div class="flex gap-3">
                <button
                  (click)="confirmSubmit()"
                  class="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 font-semibold transition-all transform hover:scale-105"
                >
                  ✓ Confirmar
                </button>
                <button
                  (click)="cancelSubmit()"
                  class="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 font-semibold transition-all transform hover:scale-105"
                >
                  ✗ Cancelar
                </button>
              </div>
            </div>
          </div>
        }
        
        <form (ngSubmit)="onSubmit()" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">
                Código do Produto *
                <span class="text-xs font-normal text-gray-500">(Formato: PROD-XXXXX)</span>
              </label>
              <div class="relative">
                <input
                  [(ngModel)]="newProduct.code"
                  (input)="formatProductCode($event)"
                  name="code"
                  type="text"
                  required
                  maxlength="10"
                  placeholder="PROD-"
                  class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-lg uppercase transition-all"
                />
                <span class="absolute right-3 top-3 text-gray-400 text-sm">
                  {{ newProduct.code.length || 0 }}/10
                </span>
              </div>
            </div>
            
            <div class="md:col-span-2">
              <label class="block text-sm font-bold text-gray-700 mb-2">Descrição do Produto *</label>
              <input
                [(ngModel)]="newProduct.description"
                name="description"
                type="text"
                required
                maxlength="100"
                class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Ex: Notebook Dell Inspiron 15 3000"
              />
              <span class="text-xs text-gray-500 mt-1 block">
                {{ newProduct.description.length || 0 }}/100 caracteres
              </span>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Saldo Inicial *</label>
              <input
                [(ngModel)]="newProduct.balance"
                name="balance"
                type="number"
                required
                min="1"
                max="999999"
                class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg"
                placeholder="Quantidade"
              />
            </div>
            
            <div class="md:col-span-2 flex items-end">
              <button
                type="submit"
                [disabled]="loading()"
                class="w-full bg-linear-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed font-bold text-lg shadow-lg transition-all transform hover:scale-[1.02] disabled:scale-100"
              >
                @if (loading()) {
                  <span class="flex items-center justify-center gap-2">
                    <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Cadastrando...
                  </span>
                } @else {
                  <span>✓ Cadastrar Produto</span>
                }
              </button>
            </div>
          </div>
        </form>
        
        @if (error()) {
          <div class="mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-700 flex items-center gap-3 animate-[shake_0.5s_ease]">
            <span class="text-2xl">❌</span>
            <span class="font-semibold">{{ error() }}</span>
          </div>
        }
        
        @if (success()) {
          <div class="mt-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg text-green-700 flex items-center gap-3 animate-[bounce_0.5s_ease]">
            <span class="text-2xl">✓</span>
            <span class="font-semibold">Produto cadastrado com sucesso!</span>
          </div>
        }
      </div>

      <!-- Lista de Produtos -->
      <div class="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200">
        <div class="px-8 py-6 bg-linear-to-r from-gray-50 to-blue-50 border-b border-gray-200">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 class="text-2xl font-bold text-gray-800">📋 Produtos Cadastrados</h2>
            
            <div class="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <input
                [ngModel]="searchTerm()"
                (ngModelChange)="searchTerm.set($event); filterProducts()"
                type="text"
                placeholder="🔍 Buscar por código ou descrição..."
                class="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-80"
              />
              
              <select
                [ngModel]="sortBy()"
                (ngModelChange)="sortBy.set($event); sortProducts()"
                class="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="code">Ordenar: Código</option>
                <option value="description">Ordenar: Descrição</option>
                <option value="balance">Ordenar: Saldo</option>
                <option value="newest">Ordenar: Mais Recentes</option>
              </select>
            </div>
          </div>
        </div>
        
        @if (loadingList()) {
          <div class="p-12 text-center">
            <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
            <p class="mt-6 text-gray-500 font-semibold text-lg">Carregando produtos...</p>
          </div>
        } @else if (filteredProducts().length === 0 && searchTerm()) {
          <div class="p-12 text-center">
            <div class="text-6xl mb-4">🔍</div>
            <p class="text-gray-500 text-lg">Nenhum produto encontrado com "<strong>{{ searchTerm() }}</strong>"</p>
            <button
              (click)="clearSearch()"
              class="mt-4 text-blue-600 hover:text-blue-800 font-semibold"
            >
              Limpar busca
            </button>
          </div>
        } @else if (products().length === 0) {
          <div class="p-12 text-center">
            <div class="text-6xl mb-4">📦</div>
            <p class="text-gray-500 text-lg">Nenhum produto cadastrado ainda.</p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-100">
                <tr>
                  <th class="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                      (click)="toggleSort('code')">
                    Código
                    @if (sortBy() === 'code') {
                      <span class="ml-1">{{ sortDirection() === 'asc' ? '↑' : '↓' }}</span>
                    }
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                      (click)="toggleSort('description')">
                    Descrição
                    @if (sortBy() === 'description') {
                      <span class="ml-1">{{ sortDirection() === 'asc' ? '↑' : '↓' }}</span>
                    }
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                      (click)="toggleSort('balance')">
                    Saldo
                    @if (sortBy() === 'balance') {
                      <span class="ml-1">{{ sortDirection() === 'asc' ? '↑' : '↓' }}</span>
                    }
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                @for (product of paginatedProducts(); track product.id) {
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
          
          <!-- Paginação -->
          <div class="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div class="flex flex-col md:flex-row justify-between items-center gap-4">
              <div class="flex items-center gap-4">
                <span class="text-sm text-gray-600 font-semibold">Registros por página:</span>
                <select
                  [ngModel]="pageSize()"
                  (ngModelChange)="pageSize.set(+$event); onPageSizeChange()"
                  class="px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                >
                  @for (size of pageSizeOptions; track size) {
                    <option [value]="size">{{ size }}</option>
                  }
                </select>
                <span class="text-sm text-gray-600">
                  Mostrando {{ (currentPage() - 1) * pageSize() + 1 }} - 
                  {{ Math.min(currentPage() * pageSize(), filteredProducts().length) }} 
                  de <strong>{{ filteredProducts().length }}</strong> produtos
                </span>
              </div>
              
              @if (totalPages() > 1) {
                <div class="flex gap-2">
                <button
                  (click)="previousPage()"
                  [disabled]="currentPage() === 1"
                  class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all"
                >
                  ← Anterior
                </button>
                
                @for (page of pageNumbers(); track page) {
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
                  (click)="nextPage()"
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
    </div>
    
    <style>
      @keyframes scale-up {
        from { transform: scale(0.8); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
      
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
      }
      
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
    </style>
  `
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  
  products = signal<Product[]>([]);
  filteredProducts = signal<Product[]>([]);
  loading = signal(false);
  loadingList = signal(true);
  error = signal('');
  success = signal(false);
  
  // Filtro e ordenação
  searchTerm = signal('');
  sortBy = signal('code');
  sortDirection = signal<'asc' | 'desc'>('asc');
  
  // Paginação
  currentPage = signal(1);
  pageSize = signal(10);
  pageSizeOptions = [10, 25, 50, 100];
  totalPages = computed(() => Math.ceil(this.filteredProducts().length / this.pageSize()));
  pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      if (current <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push(-1, total);
      } else if (current >= total - 3) {
        pages.push(1, -1);
        for (let i = total - 4; i <= total; i++) pages.push(i);
      } else {
        pages.push(1, -1);
        for (let i = current - 1; i <= current + 1; i++) pages.push(i);
        pages.push(-1, total);
      }
    }
    return pages;
  });
  
  paginatedProducts = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return this.filteredProducts().slice(start, end);
  });
  
  // Modal de confirmação
  showConfirmModal = signal(false);
  countdown = signal(5);
  private countdownInterval: any;
  pendingProduct: CreateProductRequest = { code: '', description: '', balance: null as any };
  
  newProduct: CreateProductRequest = {
    code: '',
    description: '',
    balance: null as any
  };
  
  // Para usar Math no template
  Math = Math;

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loadingList.set(true);
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products.set(products ?? []);
        this.filterProducts();
        this.loadingList.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar produtos:', err);
        this.loadingList.set(false);
      }
    });
  }
  
  formatProductCode(event: any) {
    let value = event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    if (!value.startsWith('PROD')) {
      value = 'PROD' + value;
    }
    
    if (value.length > 4) {
      value = value.substring(0, 4) + '-' + value.substring(4, 9);
    }
    
    this.newProduct.code = value;
  }
  
  filterProducts() {
    const term = this.searchTerm().toLowerCase();
    let filtered = this.products() ?? [];
    
    if (term) {
      filtered = filtered.filter(p => 
        p.code.toLowerCase().includes(term) || 
        p.description.toLowerCase().includes(term)
      );
    }
    
    this.filteredProducts.set(filtered);
    this.sortProducts();
    this.currentPage.set(1);
  }
  
  sortProducts() {
    const sorted = [...this.filteredProducts()];
    const direction = this.sortDirection() === 'asc' ? 1 : -1;
    
    sorted.sort((a, b) => {
      const sortKey = this.sortBy();
      
      if (sortKey === 'newest') {
        return direction * ((b as any).createdAt - (a as any).createdAt);
      }
      
      const aVal = (a as any)[sortKey];
      const bVal = (b as any)[sortKey];
      
      if (typeof aVal === 'string') {
        return direction * aVal.localeCompare(bVal);
      }
      
      return direction * (aVal - bVal);
    });
    
    this.filteredProducts.set(sorted);
  }
  
  toggleSort(column: string) {
    if (this.sortBy() === column) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(column);
      this.sortDirection.set('asc');
    }
    this.sortProducts();
  }
  
  clearSearch() {
    this.searchTerm.set('');
    this.filterProducts();
  }
  
  previousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }
  
  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }
  
  goToPage(page: number) {
    if (page > 0 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }
  
  onPageSizeChange() {
    this.currentPage.set(1); // Reset para primeira página ao mudar tamanho
  }

  onSubmit() {
    // Validações
    if (!this.newProduct.code?.trim()) {
      this.error.set('Código do produto é obrigatório');
      return;
    }
    
    if (this.newProduct.code.length < 10) {
      this.error.set('Código deve ter o formato PROD-XXXXX (10 caracteres)');
      return;
    }

    if (!this.newProduct.description?.trim()) {
      this.error.set('Descrição do produto é obrigatória');
      return;
    }

    if (!this.newProduct.balance || this.newProduct.balance < 1) {
      this.error.set('Saldo inicial deve ser no mínimo 1');
      return;
    }

    // Armazena produto pendente e abre modal
    this.pendingProduct = { ...this.newProduct };
    this.showConfirmModal.set(true);
    this.countdown.set(5);
    this.error.set('');
    
    // Inicia contagem regressiva
    this.countdownInterval = setInterval(() => {
      const current = this.countdown();
      if (current > 1) {
        this.countdown.set(current - 1);
      } else {
        this.confirmSubmit();
      }
    }, 1000);
  }
  
  confirmSubmit() {
    clearInterval(this.countdownInterval);
    this.showConfirmModal.set(false);
    
    this.loading.set(true);
    this.error.set('');
    this.success.set(false);

    this.productService.createProduct(this.pendingProduct).subscribe({
      next: () => {
        this.success.set(true);
        this.newProduct = { code: '', description: '', balance: null as any };
        this.loadProducts();
        this.loading.set(false);
        setTimeout(() => this.success.set(false), 3000);
      },
      error: (err) => {
        this.error.set(err.error?.error || 'Erro ao cadastrar produto');
        this.loading.set(false);
      }
    });
  }
  
  cancelSubmit() {
    clearInterval(this.countdownInterval);
    this.showConfirmModal.set(false);
    this.countdown.set(5);
  }
  
  ngOnDestroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }
}
