import { Routes } from '@angular/router';
import { ProductListComponent } from './components/product/list/product-list.component';
import { InvoiceListComponent } from './components/invoice/list/invoice-list.component';
import { InvoiceCreateComponent } from './components/invoice/create/invoice-create.component';
import { InvoiceDetailComponent } from './components/invoice/detail/invoice-detail.component';

export const routes: Routes = [
  { path: '', redirectTo: '/products', pathMatch: 'full' },
  { path: 'products', component: ProductListComponent },
  { path: 'invoices', component: InvoiceListComponent },
  { path: 'invoices/create', component: InvoiceCreateComponent },
  { path: 'invoices/:id', component: InvoiceDetailComponent }
];
