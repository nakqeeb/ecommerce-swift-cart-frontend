import { effect, Injectable, signal } from '@angular/core';
import { CartItem } from '../common/cart-item';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private readonly STORAGE_KEY = 'cartItems';

  cartItems = signal<CartItem[]>([]);
  totalPrice = signal<number>(0);
  totalQuantity = signal<number>(0);

  constructor() {
    // Load cart from localStorage on service initialization
    this.loadCartFromStorage();

    // Save cart to localStorage whenever it changes
    effect(() => {
      const cartData = JSON.stringify(this.cartItems());
      localStorage.setItem(this.STORAGE_KEY, cartData);

      // Also update totals in localStorage for consistency
      localStorage.setItem('cartTotalPrice', this.totalPrice().toString());
      localStorage.setItem('cartTotalQuantity', this.totalQuantity().toString());
    });
  }

  private loadCartFromStorage() {
    const storedItems = localStorage.getItem(this.STORAGE_KEY);
    if (storedItems) {
      try {
        const items: CartItem[] = JSON.parse(storedItems);
        this.cartItems.set(items);
        this.computeCartTotals();
      } catch (e) {
        console.error('Error parsing cart items from localStorage', e);
        this.clearCart();
      }
    } else {
      // Load totals if items are empty but totals exist
      const storedPrice = localStorage.getItem('cartTotalPrice');
      const storedQuantity = localStorage.getItem('cartTotalQuantity');

      if (storedPrice) this.totalPrice.set(parseFloat(storedPrice));
      if (storedQuantity) this.totalQuantity.set(parseInt(storedQuantity));
    }
  }

  addToCart(theCartItem: CartItem) {

    // check if we already have the item in our cart
    let alreadyExistsInCart: boolean = false;
    let existingCartItem: CartItem = undefined!;

    if (this.cartItems().length > 0) {
      // find the item in the cart based on item id

      existingCartItem = this.cartItems().find(tempCartItem => tempCartItem.id === theCartItem.id)!;

      // check if we found it
      alreadyExistsInCart = (existingCartItem != undefined);
    }

    if (alreadyExistsInCart) {
      // increment the quantity
      existingCartItem.quantity++;
    }
    else {
      // just add the item to the array
      this.cartItems.update((oldCartItems) => [...oldCartItems, theCartItem]);
    }

    // compute cart total price and total quantity
    this.computeCartTotals();
  }


  computeCartTotals() {

    let totalPriceValue: number = 0;
    let totalQuantityValue: number = 0;

    for (let currentCartItem of this.cartItems()) {
      totalPriceValue += currentCartItem.quantity * currentCartItem.unitPrice;
      totalQuantityValue += currentCartItem.quantity;
    }

    // publish the new values ... all subscribers will receive the new data
    this.totalPrice.set(totalPriceValue);
    this.totalQuantity.set(totalQuantityValue);

    // log cart data just for debugging purposes
    this.logCartData(totalPriceValue, totalQuantityValue);
  }

  private logCartData(totalPriceValue: number, totalQuantityValue: number) {

    console.log('Contents of the cart');
    for (let tempCartItem of this.cartItems()) {
      const subTotalPrice = tempCartItem.quantity * tempCartItem.unitPrice;
      console.log(`name: ${tempCartItem.name}, quantity=${tempCartItem.quantity}, unitPrice=${tempCartItem.unitPrice}, subTotalPrice=${subTotalPrice}`);
    }

    console.log(`totalPrice: ${totalPriceValue.toFixed(2)}, totalQuantity: ${totalQuantityValue}`);
    console.log('----');
  }

  decrementQuantity(theCartItem: CartItem) {

    theCartItem.quantity--;

    if (theCartItem.quantity === 0) {
      this.remove(theCartItem);
    }
    else {
      this.computeCartTotals();
    }
  }

  remove(theCartItem: CartItem) {

    // get index of item in the array
    const itemIndex = this.cartItems().findIndex( tempCartItem => tempCartItem.id === theCartItem.id );

    // if found, remove the item from the array at the given index
    if (itemIndex > -1) {
      this.cartItems().splice(itemIndex, 1);

      this.computeCartTotals();
    }
  }

  clearCart() {
    this.cartItems.set([]);
    this.totalPrice.set(0);
    this.totalQuantity.set(0);
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem('cartTotalPrice');
    localStorage.removeItem('cartTotalQuantity');
  }
}
