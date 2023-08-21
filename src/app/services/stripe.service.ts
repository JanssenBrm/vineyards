import { Injectable } from '@angular/core';
import { UserData } from '../models/userdata.model';
import Stripe from 'stripe';
import { environment } from '../../environments/environment';
import { ProductInfo } from '../premium/premium.model';

@Injectable({
  providedIn: 'root',
})
export class StripeService {
  private stripe = new Stripe(environment.stripeKey, null);

  public async createCustomer(user: UserData, email: string): Promise<string> {
    const customer = await this.stripe.customers.create({
      name: user.name,
      email,
    });
    return customer.id;
  }

  public async startPayment(user: string, customer: string, product: ProductInfo): Promise<void> {
    if (!product.priceId) {
      console.warn(`Starting payment for ${product.label} without price ID`);
      return;
    } else {
      const session = await this.stripe.checkout.sessions.create({
        billing_address_collection: 'auto',
        customer: customer,
        line_items: [
          {
            price: product.priceId,
            quantity: 1,
          },
        ],
        payment_method_types: ['card'],
        mode: 'subscription',
        success_url: `${environment.stripeRedirect}/payment-status?status=success&role=${product.label}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${environment.stripeRedirect}/payment-status?status=error`,
        metadata: {
          user,
          role: product.role,
          description: product.label,
        },
      });
      window.location.href = session.url;
    }
  }
}
