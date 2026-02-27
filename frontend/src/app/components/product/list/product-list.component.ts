import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../services/product.service';
import { Product, CreateProductRequest } from '../../../models/product.model';
import { ProductListTableComponent } from '../list-table/product-list-table.component';
import { ProductCreateConfirmModalComponent } from '../create-confirm-modal/product-create-confirm-modal.component';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule, FormsModule, ProductListTableComponent, ProductCreateConfirmModalComponent],
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
        
        <app-product-create-confirm-modal
          [visible]="showConfirmModal()"
          [countdown]="countdown()"
          [product]="pendingProduct"
          (confirm)="confirmSubmit()"
          (cancel)="cancelSubmit()"
        />
        
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
          <app-product-list-table
            [paginatedProducts]="paginatedProducts()"
            [sortBy]="sortBy()"
            [sortDirection]="sortDirection()"
            [currentPage]="currentPage()"
            [pageSize]="pageSize()"
            [pageSizeOptions]="pageSizeOptions"
            [totalPages]="totalPages()"
            [pageNumbers]="pageNumbers()"
            [filteredTotal]="filteredProducts().length"
            (toggleSort)="toggleSort($event)"
            (previousPage)="previousPage()"
            (nextPage)="nextPage()"
            (goToPage)="goToPage($event)"
            (pageSizeChange)="pageSize.set($event); onPageSizeChange()"
          />
        }
      </div>
    </div>
    
    <style>
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
