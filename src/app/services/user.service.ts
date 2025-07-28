import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { User } from '../common/user';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = environment.apiUrl + '/users';

  private user = signal<User>({email: '', firstName: '', lastName: ''});

  userInfo = this.user.asReadonly();

  private httpClient = inject(HttpClient);

  fetchCurrentUserInfo(userId: string) {
    this.httpClient.get<User>(`${this.baseUrl}/${userId}`).subscribe((response) => {
    console.log("User response: ", response);
      this.user.set(response);
    });
  }
}
