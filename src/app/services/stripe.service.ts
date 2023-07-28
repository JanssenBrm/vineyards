import { Injectable } from '@angular/core';
import { UserData } from '../models/userdata.model';
import Stripe from 'stripe';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class StripeService {
  private stripe = new Stripe(environment.stripeKey, null);

  public async createCustomer(user: UserData, email: string): Promise<string> {
    // const customer = await this.stripe.customers.create({
    //   name: user.name,
    //   email,
    // });
    // return customer.id;
    console.log(user, email);
    return undefined;
  }
}
