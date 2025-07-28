import {
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';

import { ProductService } from '../../services/product.service';
import { Product } from '../../common/product';
import { ProductCategory } from '../../common/product-category';
import { Subscription } from 'rxjs';
import { RouterLink } from '@angular/router';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../common/cart-item';

@Component({
  selector: 'app-product-list',
  imports: [CurrencyPipe, RouterLink, NgbPagination],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css',
})
export class ProductListComponent {
  categoryId = input<string>();
  keyword = input<string>();
  searchMode = false;
  products: Product[] = [];
  categoryName?: string;
  isLoading = true;

  // properties for pagination
  thePageNumber: number = 1;
  thePageSize = signal<number>(10);
  theTotalElements: number = 0;

  currentCategoryId: number = 1;
  previousCategoryId: number = 1;
  previousKeyword: string = "";

  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private destroyRef = inject(DestroyRef);

  constructor() {
    effect(() => {
      console.log('Category ID: ', this.categoryId());
      console.log('Search Keyword: ', this.keyword());
      if (!this.searchMode) {
        console.log('Fetching Category Name');
        this.fetchCurrentCategoryName();
      }
      this.listProducts();
    });
  }

  fetchCurrentCategoryName() {
    this.categoryName = '';
    let subscription: Subscription;
    if (this.categoryId()) {
      subscription = this.productService
        .getCurrentCategoryName(this.categoryId()!)
        .subscribe((data) => {
          this.categoryName = data;
        });
    } else {
      subscription = this.productService
        .getCurrentCategoryName('1')
        .subscribe((data) => {
          this.categoryName = data;
        });
    }
    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }

  listProducts() {
    this.searchMode = this.keyword() !== undefined;

    if (this.searchMode) {
      this.handleSearchProducts();
    } else {
      this.handleListProducts();
    }
  }

  handleSearchProducts() {
    if (this.previousKeyword !== this.keyword()) {
      this.thePageNumber = 1;
    }
    this.previousKeyword = this.keyword()!;
    const subscription = this.productService
      .searchProductsPaginate(
        this.thePageNumber - 1,
        this.thePageSize(),
        this.keyword()!
      )
      .subscribe(this.processResult());
    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }

  handleListProducts() {
    this.isLoading = true;
    this.products = [];
    if (this.categoryId()) {
      this.currentCategoryId = +this.categoryId()!;
    } else {
      this.currentCategoryId = 1;
    }
    if (this.previousCategoryId !== this.currentCategoryId) {
      this.thePageNumber = 1;
    }

    this.previousCategoryId = this.currentCategoryId;

    console.log(
      `currentCategoryId=${this.currentCategoryId}, thePageNumber=${this.thePageNumber}`
    );

    const subscription = this.productService
      .getProductListPaginate(
        this.thePageNumber - 1,
        this.thePageSize(),
        this.currentCategoryId
      )
      .subscribe({
        next: (data) => {
          this.products = data._embedded.products;
          this.thePageNumber = data.page.number + 1;
          this.thePageSize.set(data.page.size);
          this.theTotalElements = data.page.totalElements;
        }, complete: () =>
          this.isLoading = false
      });

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }

  updatePageSize(pageSize: string) {
    this.thePageSize.set(+pageSize);
    this.thePageNumber = 1;
  }


  addToCart(theProduct: Product) {
    const theCartItem = new CartItem(theProduct);

    this.cartService.addToCart(theCartItem);
  }

  private processResult() {
    return (data: any) => {
      this.products = data._embedded.products;
      this.thePageNumber = data.page.number + 1;
      this.thePageSize.set(data.page.size);
      this.theTotalElements = data.page.totalElements;
      this.isLoading = false;
    };
  }
}
