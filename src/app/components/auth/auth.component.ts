import { AuthService } from './../../services/auth.service';
import { Component, effect, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { equalValuesValidator } from '../../validators/equal-values.validator';
import { noWhitespace } from '../../validators/no-whitespace.validator';

@Component({
  selector: 'app-auth',
  imports: [ReactiveFormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent {
  loginMode = signal(false);
  authForm!: FormGroup;

  isLoading = false;
  private authService = inject(AuthService);

  constructor() {
    effect(() => {
      if (this.loginMode()) {
        this.authForm = new FormGroup({
          email: new FormControl('', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]),
          password: new FormControl('', [Validators.required]),
        });
      } else {
        this.authForm = new FormGroup({
          firstName: new FormControl('', [Validators.required, Validators.minLength(2), noWhitespace()]),
          lastName: new FormControl('', [Validators.required, Validators.minLength(2), noWhitespace()]),
          email: new FormControl('', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]),
          passwords: new FormGroup({
            password: new FormControl('', {
              validators: [Validators.required, Validators.minLength(6)],
            }),
            confirmPassword: new FormControl('', {
              validators: [Validators.required, Validators.minLength(6)],
            }),
          }, {
            validators: [equalValuesValidator('password', 'confirmPassword')]
          }),
        });
      }
    });
  }
isVisible: boolean = false;

  toggleVisibility() {
    this.isVisible = !this.isVisible;
  }

  ngOnInit() {
    setTimeout(() => {
      this.toggleVisibility();
    }, 0.5)
  }

  get loginPassword() { return this.authForm.get('password'); }

  get firstName() { return this.authForm.get('firstName'); }
  get lastName() { return this.authForm.get('lastName'); }
  get email() { return this.authForm.get('email'); }
  get passwords() { return this.authForm.get('passwords'); }
  get password() { return this.authForm.get('passwords.password'); }
  get confirmPassword() { return this.authForm.get('passwords.confirmPassword'); }

  switchMode() {
    this.loginMode.set(!this.loginMode());
  }

  onSubmit() {
    if (this.authForm.invalid) {
      this.authForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    if (this.loginMode()) {
      // console.log(this.email?.value, this.loginPassword?.value);
      this.authService.login(this.email?.value, this.loginPassword?.value, this.isLoading);
    } else {
      this.authService.signup(this.firstName?.value, this.lastName?.value, this.email?.value, this.password?.value).subscribe({
        next: (response) => {
          alert(`Welcome ${this.firstName?.value}! \nYour account has been created successfully. \nYou can login now.`);
        },
        error: (err) => {
          alert(`There was an error: ${err.message}`);
        },
        complete: () => {this.loginMode.set(true);
          this.isLoading = false;
        }
      });
    }
  }
}


