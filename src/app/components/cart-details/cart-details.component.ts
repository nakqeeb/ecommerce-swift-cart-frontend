import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, OnInit } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../common/cart-item';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cart-details',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './cart-details.component.html',
  styleUrls: ['./cart-details.component.css']
})
export class CartDetailsComponent implements OnInit {
  // totalPrice: number = 0;
  // totalQuantity: number = 0;

  private cartService = inject(CartService);

  cartItems = computed(() => this.cartService.cartItems());
  totalPrice = computed(() => this.cartService.totalPrice());
  totalQuantity = computed(() => this.cartService.totalQuantity());

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.listCartDetails();
  }

  listCartDetails() {
    // compute cart total price and quantity
    this.cartService.computeCartTotals();
  }

  incrementQuantity(theCartItem: CartItem) {
    this.cartService.addToCart(theCartItem);
  }

  decrementQuantity(theCartItem: CartItem) {
    this.cartService.decrementQuantity(theCartItem);
  }

  remove(theCartItem: CartItem) {
    this.cartService.remove(theCartItem);
  }

}
