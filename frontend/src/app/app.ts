import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { FailureSimulationBannerComponent } from './components/shared/failure-simulation-banner/failure-simulation-banner.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FailureSimulationBannerComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <nav class="bg-white shadow-md">
        <div class="max-w-7xl mx-auto px-4">
          <div class="flex justify-between h-16">
            <div class="flex items-center">
              <h1 class="text-2xl font-bold text-blue-600">Sistema de Estoque e Faturamento</h1>
            </div>
            <div class="flex space-x-4 items-center">
              <a 
                routerLink="/products" 
                routerLinkActive="text-blue-600 border-b-2 border-blue-600"
                class="px-3 py-2 text-gray-700 hover:text-blue-600 font-medium"
              >
                Produtos
              </a>
              <a 
                routerLink="/invoices" 
                routerLinkActive="text-blue-600 border-b-2 border-blue-600"
                class="px-3 py-2 text-gray-700 hover:text-blue-600 font-medium"
              >
                Notas Fiscais
              </a>
            </div>
          </div>
        </div>
      </nav>
      
      <main class="py-6 pb-28 md:pb-24">
        <app-failure-simulation-banner />
        <router-outlet />
      </main>
      
      <footer class="fixed bottom-0 inset-x-0 z-40 bg-linear-to-r from-gray-50 to-blue-50 border-t-2 border-blue-200">
        <div class="max-w-7xl mx-auto px-4 py-6">
          <div class="flex flex-col md:flex-row justify-between items-center gap-4">
            <div class="text-gray-700 font-semibold">
              📦 Sistema de Gerenciamento de Estoque e Notas Fiscais
            </div>
            <div class="text-gray-600">
              Desenvolvido por 
              <a href="https://github.com/jalvess021" target="_blank" class="text-blue-600 hover:text-blue-800 font-bold hover:underline">
                @jalvess021
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  `
})
export class App {}
