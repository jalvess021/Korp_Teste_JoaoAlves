import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { InvoiceService } from '../../services/invoice.service';
import { Product } from '../../models/product.model';
import { InvoiceCreateConfirmModalComponent, InvoicePendingDisplayItem } from '../invoice-create-confirm-modal/invoice-create-confirm-modal.component';
import { InvoiceCreateItemRowComponent } from '../invoice-create-item-row/invoice-create-item-row.component';

@Component({
  selector: 'app-invoice-create',
  imports: [CommonModule, FormsModule, RouterLink, InvoiceCreateConfirmModalComponent, InvoiceCreateItemRowComponent],
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

      <app-invoice-create-confirm-modal
        [visible]="showConfirmModal()"
        [countdown]="countdown()"
        [items]="pendingDisplayItems()"
        (confirm)="confirmSubmit()"
        (cancel)="cancelSubmit()"
      />

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
            <app-invoice-create-item-row
              [index]="i"
              [item]="item"
              [canRemove]="items().length > 1"
              [searchTerm]="searchTerms()[i] || ''"
              [dropdownVisible]="dropdownVisible()[i] || false"
              [filteredProducts]="filteredProductsForItem()[i] || []"
              [selectedProductIds]="selectedProductIds()"
              [selectedProductCode]="getProductCode(item.productId)"
              [selectedProductDescription]="getProductDescription(item.productId)"
              [selectedProductBalance]="getAvailableBalance(item.productId)"
              (remove)="removeItem(i)"
              (searchChange)="onSearchTermChange(i, $event)"
              (focusSearch)="showDropdown(i)"
              (selectProduct)="selectProduct(i, $event)"
              (quantityChange)="onQuantityChange(i, $event)"
            />
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
  pendingDisplayItems = signal<InvoicePendingDisplayItem[]>([]);
  selectedProductIds = computed(() => this.items().map((item) => item.productId).filter(Boolean));

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

  onSearchTermChange(index: number, term: string) {
    this.searchTerms.update((terms) => {
      const updated = [...terms];
      updated[index] = term;
      return updated;
    });

    this.filterProducts(index);
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

  onQuantityChange(index: number, quantity: number) {
    this.items.update((items) => {
      const updated = [...items];
      updated[index].quantity = quantity;
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
    this.pendingDisplayItems.set(
      this.pendingItems.map((item) => ({
        code: this.getProductCode(item.productId),
        description: this.getProductDescription(item.productId),
        quantity: item.quantity,
      }))
    );
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
