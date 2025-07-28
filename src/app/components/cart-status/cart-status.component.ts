import { Component, computed, inject, signal } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cart-status',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './cart-status.component.html',
  styleUrl: './cart-status.component.css'
})
export class CartStatusComponent {

  private cartService = inject(CartService);

  totalPrice = computed(() => this.cartService.totalPrice());
  totalQuantity = computed(() => this.cartService.totalQuantity());




}
