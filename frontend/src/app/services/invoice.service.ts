import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Invoice, CreateInvoiceRequest } from '../models/invoice.model';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private http = inject(HttpClient);
  private apiUrl = '/faturamento-api/v1/invoices';

  getInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(this.apiUrl);
  }

  getInvoiceById(id: string): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.apiUrl}/${id}`);
  }

  createInvoice(invoice: CreateInvoiceRequest): Observable<Invoice> {
    return this.http.post<Invoice>(this.apiUrl, invoice);
  }

  printInvoice(id: string, idempotencyKey: string, simulateStockFailure = false): Observable<Invoice> {
    let headers = new HttpHeaders({
      'Idempotency-Key': idempotencyKey,
    });

    if (simulateStockFailure) {
      headers = headers.set('X-Simulate-Stock-Failure', 'true');
    }

    return this.http.post<Invoice>(`${this.apiUrl}/${id}/print`, null, { headers });
  }
}
