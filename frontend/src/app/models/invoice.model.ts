export interface Invoice {
  id: string;
  number: number;
  status: 'OPEN' | 'CLOSED';
  createdAt: string;
  closedAt?: string;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  productId: string;
  quantity: number;
}

export interface CreateInvoiceRequest {
  items: {
    productId: string;
    quantity: number;
  }[];
}
