import { Component, DestroyRef, inject, input, OnInit } from '@angular/core';
import { Product } from '../../common/product';
import { ProductService } from '../../services/product.service';
import { CurrencyPipe, Location } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../common/cart-item';

@Component({
  selector: 'app-product-details',
  imports: [CurrencyPipe],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css'
})
export class ProductDetailsComponent implements OnInit {
  productId = input<string>();
  product?: Product;
  isLoading = true;

  private productService = inject(ProductService);
  private location = inject(Location);
  private destroyRef = inject(DestroyRef);
  private cartService = inject(CartService);

  ngOnInit(): void {
    window.scrollTo(0, 0);
    const subscription = this.productService.getProduct(this.productId()!).subscribe(product => {
      this.product = product;
      console.log(product);
      this.isLoading = false;
    });

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }
  goBack(): void {
    this.location.back();
  }

  addToCart() {
    const theCartItem = new CartItem(this.product!);
    this.cartService.addToCart(theCartItem);

  }


}
