import { Routes } from '@angular/router';
import { ProductListComponent } from './components/product-list/product-list.component';
import { ProductDetailsComponent } from './components/product-details/product-details.component';
import { CartDetailsComponent } from './components/cart-details/cart-details.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { AuthComponent } from './components/auth/auth.component';
import { authGuard } from './config/auth-guard';
import { OrderHistoryComponent } from './components/order-history/order-history.component';

export const routes: Routes = [
  {path: 'auth', component: AuthComponent},
  {path: 'order-history', component: OrderHistoryComponent, canActivate: [authGuard]},
  {path: 'checkout', component: CheckoutComponent, canActivate: [authGuard],},
  {path: 'cart-details', component: CartDetailsComponent},
  { path: 'products/:productId', component: ProductDetailsComponent },
  { path: 'category/:categoryId', component: ProductListComponent },
  { path: 'search/:keyword', component: ProductListComponent },
  { path: 'category', component: ProductListComponent },
  { path: 'products', component: ProductListComponent },
  { path: '', redirectTo: '/products', pathMatch: 'full' },
  { path: '**', redirectTo: '/products', pathMatch: 'full' },
];
