import { Component, computed, DestroyRef, inject, OnInit } from '@angular/core';
import { ProductCategory } from '../../common/product-category';
import { ProductService } from '../../services/product.service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-product-category-menu',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './product-category-menu.component.html',
  styleUrl: './product-category-menu.component.css'
})
export class ProductCategoryMenuComponent implements OnInit {
  productCategories: ProductCategory[] = [];
  private productService = inject(ProductService);
  private destroyRef = inject(DestroyRef);
  private authService = inject(AuthService);
  private router = inject(Router);
  isLoading = false;


  isAuth = computed(() => this.authService.getIsAuth());

  ngOnInit(): void {
    this.listProductCategories();
  }

  listProductCategories() {
    this.isLoading = true;
    const subscription = this.productService.getProductCategories().subscribe({
      next: (data) => {
        this.productCategories = data;
      }, complete: () => this.isLoading = false,
    });

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    })
  }

  toAuthPage() {
    this.router.navigateByUrl(`/auth`);
  }

  onLogout() {
    this.authService.logout();
  }
}
