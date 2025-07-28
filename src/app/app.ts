import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ProductCategoryMenuComponent } from "./components/product-category-menu/product-category-menu.component";
import { SearchComponent } from "./components/search/search.component";
import { CartStatusComponent } from "./components/cart-status/cart-status.component";
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [RouterOutlet, ProductCategoryMenuComponent, SearchComponent, CartStatusComponent]
})
export class App {
  protected title = 'angular-ecommerce';

  private router = inject(Router);
  private authService = inject(AuthService);

  isAuth = computed(() => this.authService.getIsAuth());

  ngOnInit(): void {
    this.authService.autoAuthUser();
  }

  toMyOrderPage() {
    this.router.navigateByUrl(`/order-history`);
  }


  // @HostListener('window:resize', ['$event'])
  // onResize(event: Event) {
  //   this.screenWidth = window.innerWidth; // Update width on resize
  //   console.log(this.screenWidth);
  // }
}
