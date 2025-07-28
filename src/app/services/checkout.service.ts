import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Purchase } from '../common/purchase';
import { Order } from '../common/order';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {

  private baseUrl = environment.apiUrl + '/checkout';

  private httpClient = inject(HttpClient);

  placeOrder(purchaseData: Purchase): Observable<any> {
    return this.httpClient.post<Purchase>(`${this.baseUrl}/purchase`, purchaseData);
  }

  getOrderHistory() {
    return this.httpClient.get<Order[]>(`${this.baseUrl}/orders`);
  }
}


export interface OrderItemResponse {
  productName: string;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
  productId: number;
}

export interface AddressResponse {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface OrderHistoryResponse {
  id: number;
  orderTrackingNumber: string;
  totalQuantity: number;
  totalPrice: number;
  status: string;
  dateCreated: string;
  lastUpdated: string;
  orderItems: OrderItemResponse[];
  billingAddress: AddressResponse;
  shippingAddress: AddressResponse;
}
