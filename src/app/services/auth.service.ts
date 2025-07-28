import { UserService } from './user.service';
import { CartService } from './cart.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { AuthData } from '../common/auth-data';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private baseUrl = environment.apiUrl + '/auth';

  private token = signal<string | null>(null);
  private tokenTimer: any;
  private userId = signal<string | null>(null);
  private isAuth = signal(false);

  private httpClient = inject(HttpClient);
  private router = inject(Router);
  private userService = inject(UserService);
  private cartService = inject(CartService);

  loadedToken = this.token.asReadonly();
  loadedUserId = this.userId.asReadonly();
  getIsAuth = this.isAuth.asReadonly();

  signup(
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ) {
    const authData: AuthData = {
      firstName,
      lastName,
      email,
      password,
    };
    return this.httpClient.post(this.baseUrl + '/signup', authData);
  }

  login(email: string, password: string, isLoading: boolean) {
    this.httpClient.post<LoginResponse>(this.baseUrl + '/login', { email, password }).subscribe({
      next: (response) => {
        const token = response.token;
        this.token.set(token);
        this.userId.set(response.userId);
        if (this.token() && this.userId()) {
          // Convert milliseconds to SECONDS for the timer
          const expiresInSeconds = response.expiresIn / 1000;
          this.setAuthTimer(expiresInSeconds);

          // Calculate expiration date (milliseconds to Date)
          const expirationDate = new Date(Date.now() + response.expiresIn);

          console.log(token, expirationDate, this.userId());
          this.saveAuthData(token, expirationDate, this.userId()!);

          this.userService.fetchCurrentUserInfo(response.userId);
          this.isAuth.set(true);
          this.router.navigate(['/']);
        }
      },
      complete: () => isLoading = false,
      error: (err) => console.log(err)
    })
  }

  autoAuthUser() {
    const authInformation = this.getAuthData();
    if (!authInformation) {
      return;
    }
    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();

    if (expiresIn > 0) {
      this.token.set(authInformation.token);
      this.userId.set(authInformation.userId);

      // Convert to seconds for timer
      this.setAuthTimer(expiresIn / 1000);
      this.userService.fetchCurrentUserInfo(authInformation.userId!);
      this.isAuth.set(true);
    } else {
      this.clearAuthData();
    }
  }

  logout() {
    this.token.set(null);
    this.isAuth.set(false);
    this.userId.set(null);
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.router.navigate(['/']);
    this.cartService.clearCart(); // from local storage
  }

  private setAuthTimer(durationInSeconds: number) {
    console.log('Setting timer (seconds):', durationInSeconds);
    clearTimeout(this.tokenTimer);

    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, durationInSeconds * 1000); // Convert seconds to milliseconds
  }

  private saveAuthData(token: string, expirationDate: Date, userId: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
    localStorage.setItem('userId', userId);
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId');

    if (!token || !expirationDate) {
      return null;
    }

    return {
      token: token,
      expirationDate: new Date(expirationDate),
      userId: userId
    };
  }
}

interface LoginResponse {
  userId: string;
  token: string;
  expiresIn: number;
}
