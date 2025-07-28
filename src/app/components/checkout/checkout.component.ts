import { CurrencyPipe } from '@angular/common';
import { Component, computed, effect, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ShopFormService } from '../../services/shop-form.service';
import { Country } from '../../common/country';
import { State } from '../../common/state';
import { noWhitespace } from '../../validators/no-whitespace.validator';
import { CartService } from '../../services/cart.service';
import { CheckoutService } from '../../services/checkout.service';
import { Router } from '@angular/router';
import { OrderItem } from '../../common/order-item';
import { Order } from '../../common/order';
import { Purchase } from '../../common/purchase';
import { User } from '../../common/user';
import { Address } from '../../common/address';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-checkout',
  imports: [ReactiveFormsModule, CurrencyPipe],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit {
  checkoutFormGroup = new FormGroup({
    customer: new FormGroup({
      firstName: new FormControl('', [Validators.required, Validators.minLength(2), noWhitespace()]),
      lastName: new FormControl('', [Validators.required, Validators.minLength(2), noWhitespace()],),
      // Validators.email >> ali@gmail >> correct
      // Validators.pattern >> ali@gmail >> not correct but ali@gmail.com >> correct
      email: new FormControl('', [Validators.required, /* Validators.email */ Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]),
    }),
    shippingAddress: new FormGroup({
      street: new FormControl('', [Validators.required, Validators.minLength(2), noWhitespace()]),
      city: new FormControl('', [Validators.required, Validators.minLength(2), noWhitespace()]),
      state: new FormControl('', [Validators.required]),
      country: new FormControl('', [Validators.required]),
      zipCode: new FormControl('', [Validators.required, Validators.minLength(2), noWhitespace()])
    }),
    billingAddress: new FormGroup({
      street: new FormControl('', [Validators.required, Validators.minLength(2), noWhitespace()]),
      city: new FormControl('', [Validators.required, Validators.minLength(2), noWhitespace()]),
      state: new FormControl('', [Validators.required]),
      country: new FormControl('', [Validators.required]),
      zipCode: new FormControl('', [Validators.required, Validators.minLength(2), noWhitespace()])
    }),
    creditCard: new FormGroup({
      cardType: new FormControl('', [Validators.required]),
      nameOnCard: new FormControl('', [Validators.required, Validators.minLength(2), noWhitespace()]),
      cardNumber: new FormControl('', [Validators.required, Validators.pattern('[0-9]{16}')]),
      securityCode: new FormControl('', [Validators.required, Validators.pattern('[0-9]{3}')]),
      expirationMonth: new FormControl('', [Validators.required]),
      expirationYear: new FormControl('', [Validators.required])
    })
  });


  isLoading = false;

  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];

  countries: Country[] = [];

  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];

  private shopFormService = inject(ShopFormService);
  private cartService = inject(CartService);
  private checkoutService = inject(CheckoutService);
  private userService = inject(UserService);
  private router = inject(Router);


  totalPrice = computed(() => this.cartService.totalPrice());
  totalQuantity = computed(() => this.cartService.totalQuantity());

  constructor() {
    effect(() => {
      this.checkoutFormGroup.controls.customer.patchValue({
        firstName: this.userService.userInfo()!.firstName,
        lastName: this.userService.userInfo().lastName,
        email: this.userService.userInfo().email
      });
    });
  }

  ngOnInit() {
    window.scrollTo(0, 0);
    if (this.cartService.cartItems().length === 0) {
      this.router.navigateByUrl("/products");
    }
    // populate credit card months
    const startMonth: number = new Date().getMonth() + 1; // months in JS are zero based
    console.log("startMonth: " + startMonth);

    this.shopFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        console.log("Retrieved credit card months: " + JSON.stringify(data));
        this.creditCardMonths = data;
      }
    );

    // populate credit card years

    this.shopFormService.getCreditCardYears().subscribe(
      data => {
        console.log("Retrieved credit card years: " + JSON.stringify(data));
        this.creditCardYears = data;
      }
    );

    // populate countries

    this.shopFormService.getCountries().subscribe(
      data => {
        console.log("Retrieved countries: " + JSON.stringify(data));
        this.countries = data;
      }
    );
  }


  get firstName() { return this.checkoutFormGroup.controls.customer.get('firstName'); }
  get lastName() { return this.checkoutFormGroup.get('customer.lastName'); }
  get email() { return this.checkoutFormGroup.get('customer.email'); }

  get shippingAddressStreet() { return this.checkoutFormGroup.get('shippingAddress.street'); }
  get shippingAddressCity() { return this.checkoutFormGroup.get('shippingAddress.city'); }
  get shippingAddressState() { return this.checkoutFormGroup.get('shippingAddress.state'); }
  get shippingAddressZipCode() { return this.checkoutFormGroup.get('shippingAddress.zipCode'); }
  get shippingAddressCountry() { return this.checkoutFormGroup.get('shippingAddress.country'); }

  get billingAddressStreet() { return this.checkoutFormGroup.get('billingAddress.street'); }
  get billingAddressCity() { return this.checkoutFormGroup.get('billingAddress.city'); }
  get billingAddressState() { return this.checkoutFormGroup.get('billingAddress.state'); }
  get billingAddressZipCode() { return this.checkoutFormGroup.get('billingAddress.zipCode'); }
  get billingAddressCountry() { return this.checkoutFormGroup.get('billingAddress.country'); }

  get creditCardType() { return this.checkoutFormGroup.get('creditCard.cardType'); }
  get creditCardNameOnCard() { return this.checkoutFormGroup.get('creditCard.nameOnCard'); }
  get creditCardNumber() { return this.checkoutFormGroup.get('creditCard.cardNumber'); }
  get creditCardSecurityCode() { return this.checkoutFormGroup.get('creditCard.securityCode'); }
  get creditCardExpirationMonth() { return this.checkoutFormGroup.get('creditCard.expirationMonth'); }
  get creditCardExpirationYear() { return this.checkoutFormGroup.get('creditCard.expirationYear'); }

  copyShippingAddressToBillingAddress(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.checkoutFormGroup.controls.billingAddress
        .patchValue(this.checkoutFormGroup.controls.shippingAddress.value);

      // bug fix for states
      this.billingAddressStates = this.shippingAddressStates;
    }
    else {
      this.checkoutFormGroup.controls.billingAddress.reset();

      // bug fix for states
      this.billingAddressStates = [];
    }

  }

  onSubmit() {
    console.log("Handling the submit button");

    if (this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    // set up order
    let order = new Order(this.totalQuantity(), this.totalPrice());

    // get cart items
    const cartItems = this.cartService.cartItems;

    // - short way of doing the same thingy
    let orderItems: OrderItem[] = cartItems().map(tempCartItem => new OrderItem(tempCartItem.imageUrl!, tempCartItem.unitPrice!, tempCartItem.quantity, tempCartItem.id!));

    // set up purchase
    let purchase = new Purchase();

    // populate purchase - user
    let user = new User();
    user.email = this.checkoutFormGroup.controls.customer.get('email')?.value!;
    user.firstName = this.checkoutFormGroup.controls.customer.get('firstName')?.value!;
    user.lastName = this.checkoutFormGroup.controls.customer.get('lastName')?.value!;
    purchase.user = user;

    // populate purchase - shipping address
    let shippingAddress = new Address();
    shippingAddress.city = this.checkoutFormGroup.controls.shippingAddress.get('city')?.value!;
    shippingAddress.state = this.checkoutFormGroup.controls.shippingAddress.get('state')?.value!;
    shippingAddress.country = this.checkoutFormGroup.controls.shippingAddress.get('country')?.value!;
    shippingAddress.street = this.checkoutFormGroup.controls.shippingAddress.get('street')?.value!;
    shippingAddress.zipCode = this.checkoutFormGroup.controls.shippingAddress.get('zipCode')?.value!;
    purchase.shippingAddress = shippingAddress;
    const shippingState: State = JSON.parse(JSON.stringify(purchase.shippingAddress.state));
    const shippingCountry: Country = JSON.parse(JSON.stringify(purchase.shippingAddress.country));
    purchase.shippingAddress.state = shippingState.name!;
    purchase.shippingAddress.country = shippingCountry.name!;

    // populate purchase - billing address
    let billingAddress = new Address();
    billingAddress.city = this.checkoutFormGroup.controls.billingAddress.get('city')?.value!;
    billingAddress.state = this.checkoutFormGroup.controls.billingAddress.get('state')?.value!;
    billingAddress.country = this.checkoutFormGroup.controls.billingAddress.get('country')?.value!;
    billingAddress.street = this.checkoutFormGroup.controls.billingAddress.get('street')?.value!;
    billingAddress.zipCode = this.checkoutFormGroup.controls.billingAddress.get('zipCode')?.value!;
    purchase.billingAddress = billingAddress;
    const billingState: State = JSON.parse(JSON.stringify(purchase.billingAddress.state));
    const billingCountry: Country = JSON.parse(JSON.stringify(purchase.billingAddress.country));
    purchase.billingAddress.state = billingState.name!;
    purchase.billingAddress.country = billingCountry.name!;

    // populate purchase - order and orderItems
    purchase.order = order;
    purchase.orderItems = orderItems;

    // call REST API via the CheckoutService
    this.checkoutService.placeOrder(purchase).subscribe({
      next: response => {
        alert(`Your order has been received.\nOrder tracking number: ${response.orderTrackingNumber}`);

        // reset cart
        this.resetCart();

      },
      complete: () => this.isLoading = false,
      error: err => {
        alert(`There was an error: ${err.message}`);
      }
    }
    );
  }

  private resetCart() {
    // reset cart data
    this.cartService.cartItems.set([]);
    this.cartService.totalPrice.set(0);
    this.cartService.totalQuantity.set(0);

    // reset the form
    this.checkoutFormGroup.reset();

    // navigate back to the products page
    this.router.navigateByUrl("/products");
  }

  handleMonthsAndYears() {

    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');

    const currentYear: number = new Date().getFullYear();
    const selectedYear: number = Number(creditCardFormGroup?.value.expirationYear);

    // if the current year equals the selected year, then start with the current month

    let startMonth: number;

    if (currentYear === selectedYear) {
      startMonth = new Date().getMonth() + 1;
    }
    else {
      startMonth = 1;
    }

    this.shopFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        console.log("Retrieved credit card months: " + JSON.stringify(data));
        this.creditCardMonths = data;
      }
    );
  }

  getStates(formGroupName: string) {

    const formGroup = this.checkoutFormGroup.get(formGroupName);

    const countryCode = formGroup?.value.country.code;
    const countryName = formGroup?.value.country.name;

    console.log(`${formGroupName} country code: ${countryCode}`);
    console.log(`${formGroupName} country name: ${countryName}`);

    this.shopFormService.getStates(countryCode).subscribe(
      data => {

        if (formGroupName === 'shippingAddress') {
          this.shippingAddressStates = data;
        }
        else {
          this.billingAddressStates = data;
        }

        // select first item by default
        formGroup?.get('state')?.setValue(data[0]);
      }
    );
  }
}
