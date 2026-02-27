import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { InvoiceService } from '../../services/invoice.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-invoice-create',
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-5xl mx-auto px-4 py-8">
      <div class="mb-6">
        <a routerLink="/invoices" class="text-blue-600 hover:underline flex items-center gap-1 font-semibold">
          ← Voltar para lista
        </a>
      </div>

      <h1 class="text-4xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          <span class="text-blue-600">📝</span>
        Criar Nova Nota Fiscal
      </h1>

      @if (showConfirmModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
          <div class="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl animate-[scale-up_0.2s_ease-out]">
            <div class="text-center mb-6">
              <div class="text-6xl mb-4">⏱️</div>
              <h3 class="text-2xl font-bold text-gray-900 mb-2">Confirmar Criação da Nota</h3>
              <p class="text-gray-600 mb-4">Revise os itens antes de confirmar</p>
              <div class="text-5xl font-bold text-blue-600 mb-2">{{ countdown() }}</div>
              <p class="text-sm text-gray-500">segundos para cancelar</p>
            </div>
            
            <div class="bg-gray-50 rounded-lg p-6 mb-6 text-left max-h-96 overflow-y-auto">
              <h4 class="font-bold mb-3 text-lg">Itens da Nota:</h4>
              @for (item of pendingItems; track $index; let i = $index) {
                @if (item.productId) {
                  <div class="bg-white p-3 rounded-lg mb-2 border border-gray-200">
                    <p class="text-sm">
                      <strong class="text-blue-600">{{ getProductCode(item.productId) }}</strong> - 
                      {{ getProductDescription(item.productId) }}
                    </p>
                    <p class="text-sm text-gray-600 mt-1">
                      Quantidade: <strong>{{ item.quantity }}</strong> unidades
                    </p>
                  </div>
                }
              }
              <div class="mt-4 pt-4 border-t border-gray-300">
                <p class="font-bold text-lg">Total de itens: {{ pendingItems.length }}</p>
              </div>
            </div>
            
            <div class="flex gap-3">
              <button
                (click)="confirmSubmit()"
                class="flex-1 bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 font-bold text-lg transition-all transform hover:scale-105"
              >
                ✓ Confirmar e Criar
              </button>
              <button
                (click)="cancelSubmit()"
                class="flex-1 bg-red-600 text-white py-4 px-6 rounded-lg hover:bg-red-700 font-bold text-lg transition-all transform hover:scale-105"
              >
                ✗ Cancelar
              </button>
            </div>
          </div>
        </div>
      }

      @if (loadingProducts()) {
        <div class="bg-white shadow-xl rounded-2xl p-8 text-center border border-gray-200">
          <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p class="mt-6 text-gray-500 font-semibold text-lg">Carregando produtos...</p>
        </div>
      } @else if (products().length === 0) {
        <div class="bg-white shadow-xl rounded-2xl p-12 text-center border border-gray-200">
          <div class="text-6xl mb-4">📦</div>
          <p class="text-gray-600 text-lg mb-6">Nenhum produto com saldo disponível.</p>
          <a routerLink="/products" class="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold">
            Cadastrar Produtos →
          </a>
        </div>
      } @else {
        <div class="bg-linear-to-br from-white to-blue-50 shadow-xl rounded-2xl p-8 border border-blue-100">
          <h2 class="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
            <span class="text-blue-600">🛒</span>
            Itens da Nota Fiscal
          </h2>

          @for (item of items(); track $index; let i = $index) {
            <div class="mb-6 p-6 bg-white rounded-xl shadow-md border border-gray-200">
              <div class="flex items-center justify-between mb-4">
                <span class="text-lg font-bold text-gray-700">Item #{{ i + 1 }}</span>
                <button
                  (click)="removeItem(i)"
                  type="button"
                  [disabled]="items().length === 1"
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
                    @if (!item.productId && searchTerms()[i]) {
                      <span class="text-xs font-normal text-gray-500">(buscando: "{{ searchTerms()[i] }}")</span>
                    }
                  </label>
                  
                  <div class="relative">
                    <input
                      [(ngModel)]="searchTerms()[i]"
                      (input)="filterProducts(i)"
                      (focus)="showDropdown(i)"
                      type="text"
                      placeholder="🔍 Digite para buscar produto..."
                      class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    
                    @if (dropdownVisible()[i] && (filteredProductsForItem()[i]?.length ?? 0) > 0) {
                      <div class="absolute z-10 w-full mt-2 bg-white border-2 border-gray-300 rounded-lg shadow-2xl max-h-64 overflow-y-auto">
                        @for (product of filteredProductsForItem()[i]; track product.id) {
                          @if (isProductSelected(product.id, i)) {
                            <div class="w-full px-4 py-3 text-left bg-gray-100 border-b border-gray-100 opacity-50 cursor-not-allowed">
                              <div class="font-bold text-gray-400 font-mono">{{ product.code }} 🚫</div>
                              <div class="text-sm text-gray-500">{{ product.description }}</div>
                              <div class="text-xs text-red-500 mt-1">
                                Já selecionado em outro item
                              </div>
                            </div>
                          } @else {
                            <button
                              (click)="selectProduct(i, product)"
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
                        <strong class="font-mono">{{ getProductCode(item.productId) }}</strong> - {{ getProductDescription(item.productId) }}
                      </div>
                      <div class="text-sm text-gray-600 mt-1">
                        Saldo disponível: <span class="font-bold text-blue-600">{{ getAvailableBalance(item.productId) }}</span> unidades
                      </div>
                    </div>
                  }
                </div>
                
                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-2">Quantidade *</label>
                  <input
                    [(ngModel)]="item.quantity"
                    type="number"
                    min="1"
                    [max]="getAvailableBalance(item.productId)"
                    [disabled]="!item.productId"
                    class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg disabled:bg-gray-100"
                    placeholder="Digite a quantidade"
                  />
                </div>
              </div>
            </div>
          }

          <button
            (click)="addItem()"
            type="button"
            class="w-full py-4 px-6 border-4 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 mb-6 transition-all font-bold text-lg"
          >
            + Adicionar Novo Item
          </button>

          @if (error()) {
            <div class="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-700 flex items-center gap-3 animate-[shake_0.5s_ease]">
              <span class="text-2xl">❌</span>
              <span class="font-semibold">{{ error() }}</span>
            </div>
          }

          <div class="flex gap-4">
            <button
              (click)="onSubmit()"
              [disabled]="loading() || items().length === 0"
              class="flex-1 bg-linear-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed font-bold text-lg shadow-lg transition-all transform hover:scale-[1.02]"
            >
              @if (loading()) {
                <span class="flex items-center justify-center gap-2">
                  <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Criando...
                </span>
              } @else {
                <span>✓ Criar Nota Fiscal</span>
              }
            </button>
            <a
              routerLink="/invoices"
              class="flex-1 bg-gray-200 text-gray-700 py-4 px-6 rounded-xl hover:bg-gray-300 text-center font-bold text-lg transition-all"
            >
              Cancelar
            </a>
          </div>
        </div>
      }
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
    </style>
  `
})
export class InvoiceCreateComponent implements OnInit {
  private productService = inject(ProductService);
  private invoiceService = inject(InvoiceService);
  private router = inject(Router);
  
  products = signal<Product[]>([]);
  items = signal<Array<{ productId: string; quantity: number }>>([
    { productId: '', quantity: null as any }
  ]);
  
  // Select pesquisável
  searchTerms = signal<string[]>(['']);
  filteredProductsForItem = signal<Product[][]>([[]]);
  dropdownVisible = signal<boolean[]>([false]);
  
  // Modal de confirmação
  showConfirmModal = signal(false);
  countdown = signal(5);
  private countdownInterval: any;
  pendingItems: Array<{ productId: string; quantity: number }> = [];
  
  loading = signal(false);
  loadingProducts = signal(true);
  error = signal('');

  ngOnInit() {
    this.productService.getProducts().subscribe({
      next: (products) => {
        const safeProducts = products ?? [];
        // Filtra apenas produtos com saldo disponível
        const availableProducts = safeProducts.filter(p => p.balance > 0);
        this.products.set(availableProducts);
        this.filteredProductsForItem.set([availableProducts]);
        this.loadingProducts.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar produtos:', err);
        this.loadingProducts.set(false);
      }
    });
  }

  filterProducts(index: number) {
    const term = this.searchTerms()[index]?.toLowerCase() || '';
    const allProducts = this.products();
    
    if (!term) {
      this.updateFilteredProducts(index, allProducts);
      return;
    }
    
    const filtered = allProducts.filter(p =>
      p.code.toLowerCase().includes(term) ||
      p.description.toLowerCase().includes(term)
    );
    
    this.updateFilteredProducts(index, filtered);
    this.dropdownVisible.update(visible => {
      const updated = [...visible];
      updated[index] = true;
      return updated;
    });
  }
  
  updateFilteredProducts(index: number, products: Product[]) {
    this.filteredProductsForItem.update(filtered => {
      const updated = [...filtered];
      updated[index] = products;
      return updated;
    });
  }
  
  showDropdown(index: number) {
    this.dropdownVisible.update(visible => {
      const updated = [...visible];
      updated[index] = true;
      return updated;
    });
  }
  
  selectProduct(index: number, product: Product) {
    this.items.update(items => {
      const updated = [...items];
      updated[index].productId = product.id;
      updated[index].quantity = null as any;
      return updated;
    });
    
    this.searchTerms.update(terms => {
      const updated = [...terms];
      updated[index] = `${product.code} - ${product.description}`;
      return updated;
    });
    
    this.dropdownVisible.update(visible => {
      const updated = [...visible];
      updated[index] = false;
      return updated;
    });
  }

  addItem() {
    this.items.update(items => [...items, { productId: '', quantity: null as any }]);
    this.searchTerms.update(terms => [...terms, '']);
    this.filteredProductsForItem.update(filtered => [...filtered, this.products()]);
    this.dropdownVisible.update(visible => [...visible, false]);
  }

  removeItem(index: number) {
    if (this.items().length > 1) {
      this.items.update(items => items.filter((_, i) => i !== index));
      this.searchTerms.update(terms => terms.filter((_, i) => i !== index));
      this.filteredProductsForItem.update(filtered => filtered.filter((_, i) => i !== index));
      this.dropdownVisible.update(visible => visible.filter((_, i) => i !== index));
    }
  }

  getAvailableBalance(productId: string): number {
    const product = this.products().find(p => p.id === productId);
    return product?.balance || 0;
  }
  
  getProductCode(productId: string): string {
    const product = this.products().find(p => p.id === productId);
    return product?.code || '';
  }
  
  getProductDescription(productId: string): string {
    const product = this.products().find(p => p.id === productId);
    return product?.description || '';
  }
  
  isProductSelected(productId: string, currentIndex: number): boolean {
    // Verifica se o produto já foi selecionado em outro item (exceto o atual)
    return this.items().some((item, index) => 
      index !== currentIndex && item.productId === productId
    );
  }

  onProductChange(index: number) {
    this.items.update(items => {
      const updated = [...items];
      updated[index].quantity = null as any;
      return updated;
    });
  }

  onSubmit() {
    // Validações
    const validItems = this.items().filter(item => item.productId && item.quantity > 0);
    
    if (validItems.length === 0) {
      this.error.set('Adicione pelo menos um item válido com produto e quantidade');
      return;
    }

    // Valida se todos os items têm produto e quantidade
    for (let i = 0; i < this.items().length; i++) {
      const item = this.items()[i];
      
      if (!item.productId) {
        this.error.set(`Item ${i + 1}: Selecione um produto`);
        return;
      }

      if (!item.quantity || item.quantity < 1) {
        this.error.set(`Item ${i + 1}: Informe uma quantidade válida (mínimo 1)`);
        return;
      }

      const availableBalance = this.getAvailableBalance(item.productId);
      if (item.quantity > availableBalance) {
        const product = this.products().find(p => p.id === item.productId);
        this.error.set(`Item ${i + 1} (${product?.code}): Quantidade solicitada (${item.quantity}) é maior que o saldo disponível (${availableBalance})`);
        return;
      }
    }

    // Verifica produtos duplicados
    const productIds = this.items().map(item => item.productId);
    const duplicates = productIds.filter((id, index) => productIds.indexOf(id) !== index);
    if (duplicates.length > 0) {
      this.error.set('Não é permitido adicionar o mesmo produto mais de uma vez na nota');
      return;
    }

    // Armazena items pendentes e abre modal
    this.pendingItems = [...validItems];
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

    this.invoiceService.createInvoice({ items: this.pendingItems }).subscribe({
      next: (invoice) => {
        this.router.navigate(['/invoices', invoice.id]);
      },
      error: (err) => {
        this.error.set(err.error?.error || 'Erro ao criar nota fiscal');
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
