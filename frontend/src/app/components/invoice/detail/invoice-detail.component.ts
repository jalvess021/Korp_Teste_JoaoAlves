import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Invoice } from '../../../models/invoice.model';
import { Product } from '../../../models/product.model';
import { InvoiceService } from '../../../services/invoice.service';
import { ProductService } from '../../../services/product.service';
import { FailureSimulationService } from '../../../services/failure-simulation.service';

@Component({
  selector: 'app-invoice-detail',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-5xl mx-auto px-4 py-8">
      <div class="mb-6">
        <a routerLink="/invoices" class="text-blue-600 hover:underline flex items-center gap-1 font-semibold">
          ← Voltar para lista
        </a>
      </div>

      @if (loading()) {
        <div class="bg-white shadow-xl rounded-2xl p-8 text-center border border-gray-200">
          <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p class="mt-6 text-gray-500 font-semibold text-lg">Carregando nota fiscal...</p>
        </div>
      } @else if (invoice()) {
        <div class="bg-linear-to-r from-blue-600 to-blue-700 rounded-2xl shadow-2xl p-8 mb-6 text-white">
          <div class="flex flex-col md:flex-row justify-between items-start gap-6">
            <div class="flex-1">
              <h1 class="text-4xl font-bold">
                Nota Fiscal <span class="font-mono">#{{ invoice()!.number }}</span>
              </h1>
              <div class="space-y-2 text-blue-100 mt-3">
                <p><span class="font-semibold">Criada em:</span> {{ invoice()!.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
                @if (invoice()!.closedAt) {
                  <p><span class="font-semibold">Fechada em:</span> {{ invoice()!.closedAt | date:'dd/MM/yyyy HH:mm' }}</p>
                }
              </div>
            </div>

            <div class="flex items-end">
              @if (invoice()!.status === 'OPEN') {
                <span class="px-5 py-2 rounded-full text-sm font-bold bg-white text-blue-700 shadow-md">Aberta</span>
              } @else {
                <span class="px-5 py-2 rounded-full text-sm font-bold bg-gray-100 text-gray-800 shadow-md">Fechada</span>
              }
            </div>
          </div>
        </div>

        <div class="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200 mb-6">
          <div class="px-8 py-6 bg-linear-to-r from-gray-50 to-blue-50 border-b border-gray-200">
            <h2 class="text-2xl font-bold text-gray-800">📦 Itens da Nota</h2>
            <p class="text-gray-600 mt-1">
              Total: <strong>{{ invoice()!.items.length }}</strong> {{ invoice()!.items.length === 1 ? 'item' : 'itens' }}
            </p>
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-100">
                <tr>
                  <th class="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Produto</th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Quantidade</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                @for (item of invoice()!.items; track item.id) {
                  <tr class="hover:bg-blue-50 transition-colors">
                    <td class="px-6 py-4 text-gray-900 font-semibold">{{ getProductDescription(item.productId) }}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="px-4 py-2 rounded-full text-sm font-bold bg-blue-100 text-blue-800">{{ item.quantity }} un.</span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        @if (printError()) {
          <div class="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-700 flex items-center gap-3 animate-[shake_0.5s_ease]">
            <span class="text-2xl">❌</span>
            <span class="font-semibold">{{ printError() }}</span>
          </div>
        }

        @if (printSuccess()) {
          <div class="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg text-green-700 flex items-center gap-3 animate-[scale-up_0.3s_ease-out]">
            <span class="text-2xl">✓</span>
            <span class="font-semibold">Nota fiscal impressa com sucesso! Estoque atualizado.</span>
          </div>
        }

        <div class="bg-white shadow-xl rounded-2xl p-8 border border-gray-200">
          @if (invoice()!.status === 'OPEN') {
            <button
              (click)="printInvoice()"
              [disabled]="printing()"
              class="w-full bg-linear-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed font-bold text-lg shadow-lg transition-all transform hover:scale-[1.02] disabled:scale-100"
            >
              @if (printing()) {
                <span class="flex items-center justify-center gap-2">
                  <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Processando impressão...
                </span>
              } @else {
                <span>🖨️ Imprimir Nota Fiscal</span>
              }
            </button>

            <div class="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <p class="text-sm text-blue-800 font-semibold text-center">
                ⚠️ A impressão irá debitar o estoque dos produtos e fechar a nota.
              </p>
            </div>
          } @else {
            <div class="bg-gray-50 border border-gray-200 rounded-md p-4 text-center text-gray-600">
              ✓ Esta nota já foi impressa e fechada. Não é possível reimprimir.
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class InvoiceDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private invoiceService = inject(InvoiceService);
  private productService = inject(ProductService);
  private failureSimulation = inject(FailureSimulationService);

  invoice = signal<Invoice | null>(null);
  products = signal<Product[]>([]);
  loading = signal(true);
  printing = signal(false);
  printError = signal('');
  printSuccess = signal(false);

  ngOnInit() {
    const id = this.route.snapshot.params['id'];

    this.productService.getProducts().subscribe({
      next: (products) => this.products.set(products),
    });

    this.loadInvoice(id);
  }

  loadInvoice(id: string) {
    this.loading.set(true);
    this.invoiceService.getInvoiceById(id).subscribe({
      next: (invoice) => {
        this.invoice.set(invoice);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar nota:', err);
        this.loading.set(false);
      },
    });
  }

  getProductDescription(productId: string): string {
    const product = this.products().find((p) => p.id === productId);
    return product ? `${product.code} - ${product.description}` : 'Produto não encontrado';
  }

  printInvoice() {
    if (!this.invoice()) return;

    this.printing.set(true);
    this.printError.set('');
    this.printSuccess.set(false);

    const idempotencyKey = `print-${this.invoice()!.id}-${Date.now()}`;
    const shouldSimulateFailure = this.failureSimulation.selected();

    this.invoiceService.printInvoice(this.invoice()!.id, idempotencyKey, shouldSimulateFailure).subscribe({
      next: (updatedInvoice) => {
        this.invoice.set(updatedInvoice);
        this.printSuccess.set(true);
        this.printing.set(false);

        this.productService.getProducts().subscribe({
          next: (products) => this.products.set(products),
        });
      },
      error: (err) => {
        this.printError.set(err.error?.error || 'Erro ao imprimir nota fiscal');
        this.printing.set(false);
      },
    });
  }
}
