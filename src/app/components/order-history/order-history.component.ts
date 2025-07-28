import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CheckoutService } from '../../services/checkout.service';
import { CurrencyPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-order-history',
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './order-history.component.html',
  styleUrl: './order-history.component.css'
})
export class OrderHistoryComponent {
  orders = signal<any>([]);
  isLoading = true;
  error = signal<string | null>(null);

  private checkoutService = inject(CheckoutService);

  ngOnInit() {
    window.scrollTo(0, 0);
    this.checkoutService.getOrderHistory().subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.isLoading = false;
        console.log('My orders: ', orders);
      },
      error: (err) => {
        this.error.set('Failed to load order history. Please try again later.');
        console.error('Order history error:', err);
        this.isLoading = false;
      }
    });
  }

}
