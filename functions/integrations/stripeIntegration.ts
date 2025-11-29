import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Stripe Integration - Payments & Billing
 * Customers, Products, Prices, Subscriptions, Invoices, Payment Intents
 */

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });

    const { action, data } = await req.json();
    const stripeKey = Deno.env.get('STRIPE_API_KEY');

    const stripeFetch = async (endpoint, options = {}) => {
      const response = await fetch(`https://api.stripe.com/v1${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${stripeKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          ...options.headers
        }
      });
      return response.json();
    };

    const toFormData = (obj) => new URLSearchParams(Object.entries(obj).filter(([_, v]) => v !== undefined).flatMap(([k, v]) => 
      typeof v === 'object' ? Object.entries(v).map(([k2, v2]) => [`${k}[${k2}]`, v2]) : [[k, v]])).toString();

    const actions = {
      // Customers
      listCustomers: async ({ limit = 10, email }) => stripeFetch(`/customers?limit=${limit}${email ? `&email=${email}` : ''}`),
      getCustomer: async ({ customerId }) => stripeFetch(`/customers/${customerId}`),
      createCustomer: async ({ email, name, phone, metadata }) => stripeFetch('/customers', { method: 'POST', body: toFormData({ email, name, phone, ...metadata && { metadata } }) }),
      updateCustomer: async ({ customerId, email, name }) => stripeFetch(`/customers/${customerId}`, { method: 'POST', body: toFormData({ email, name }) }),
      deleteCustomer: async ({ customerId }) => stripeFetch(`/customers/${customerId}`, { method: 'DELETE' }),

      // Products
      listProducts: async ({ limit = 10, active }) => stripeFetch(`/products?limit=${limit}${active !== undefined ? `&active=${active}` : ''}`),
      getProduct: async ({ productId }) => stripeFetch(`/products/${productId}`),
      createProduct: async ({ name, description, active = true, metadata }) => stripeFetch('/products', { method: 'POST', body: toFormData({ name, description, active }) }),
      updateProduct: async ({ productId, name, description, active }) => stripeFetch(`/products/${productId}`, { method: 'POST', body: toFormData({ name, description, active }) }),

      // Prices
      listPrices: async ({ product, limit = 10 }) => stripeFetch(`/prices?limit=${limit}${product ? `&product=${product}` : ''}`),
      getPrice: async ({ priceId }) => stripeFetch(`/prices/${priceId}`),
      createPrice: async ({ product, unitAmount, currency = 'usd', recurring }) => stripeFetch('/prices', { method: 'POST', body: toFormData({ product, unit_amount: unitAmount, currency, ...recurring && { 'recurring[interval]': recurring.interval } }) }),

      // Subscriptions
      listSubscriptions: async ({ customer, status, limit = 10 }) => stripeFetch(`/subscriptions?limit=${limit}${customer ? `&customer=${customer}` : ''}${status ? `&status=${status}` : ''}`),
      getSubscription: async ({ subscriptionId }) => stripeFetch(`/subscriptions/${subscriptionId}`),
      createSubscription: async ({ customer, items, paymentBehavior = 'default_incomplete' }) => stripeFetch('/subscriptions', { method: 'POST', body: toFormData({ customer, 'items[0][price]': items[0].price, payment_behavior: paymentBehavior }) }),
      updateSubscription: async ({ subscriptionId, items, cancelAtPeriodEnd }) => stripeFetch(`/subscriptions/${subscriptionId}`, { method: 'POST', body: toFormData({ cancel_at_period_end: cancelAtPeriodEnd }) }),
      cancelSubscription: async ({ subscriptionId }) => stripeFetch(`/subscriptions/${subscriptionId}`, { method: 'DELETE' }),

      // Invoices
      listInvoices: async ({ customer, status, limit = 10 }) => stripeFetch(`/invoices?limit=${limit}${customer ? `&customer=${customer}` : ''}${status ? `&status=${status}` : ''}`),
      getInvoice: async ({ invoiceId }) => stripeFetch(`/invoices/${invoiceId}`),
      createInvoice: async ({ customer, autoAdvance = true }) => stripeFetch('/invoices', { method: 'POST', body: toFormData({ customer, auto_advance: autoAdvance }) }),
      finalizeInvoice: async ({ invoiceId }) => stripeFetch(`/invoices/${invoiceId}/finalize`, { method: 'POST' }),
      payInvoice: async ({ invoiceId }) => stripeFetch(`/invoices/${invoiceId}/pay`, { method: 'POST' }),
      voidInvoice: async ({ invoiceId }) => stripeFetch(`/invoices/${invoiceId}/void`, { method: 'POST' }),

      // Payment Intents
      listPaymentIntents: async ({ customer, limit = 10 }) => stripeFetch(`/payment_intents?limit=${limit}${customer ? `&customer=${customer}` : ''}`),
      getPaymentIntent: async ({ paymentIntentId }) => stripeFetch(`/payment_intents/${paymentIntentId}`),
      createPaymentIntent: async ({ amount, currency = 'usd', customer, paymentMethodTypes = ['card'] }) => stripeFetch('/payment_intents', { method: 'POST', body: toFormData({ amount, currency, customer, 'payment_method_types[]': paymentMethodTypes[0] }) }),
      confirmPaymentIntent: async ({ paymentIntentId, paymentMethod }) => stripeFetch(`/payment_intents/${paymentIntentId}/confirm`, { method: 'POST', body: toFormData({ payment_method: paymentMethod }) }),
      cancelPaymentIntent: async ({ paymentIntentId }) => stripeFetch(`/payment_intents/${paymentIntentId}/cancel`, { method: 'POST' }),

      // Checkout Sessions
      createCheckoutSession: async ({ mode = 'payment', lineItems, successUrl, cancelUrl, customer }) => stripeFetch('/checkout/sessions', { method: 'POST', body: toFormData({ mode, 'line_items[0][price]': lineItems[0].price, 'line_items[0][quantity]': lineItems[0].quantity, success_url: successUrl, cancel_url: cancelUrl, customer }) }),
      getCheckoutSession: async ({ sessionId }) => stripeFetch(`/checkout/sessions/${sessionId}`),

      // Balance
      getBalance: async () => stripeFetch('/balance'),
      listBalanceTransactions: async ({ limit = 10 }) => stripeFetch(`/balance_transactions?limit=${limit}`),

      // Refunds
      createRefund: async ({ paymentIntent, amount, reason }) => stripeFetch('/refunds', { method: 'POST', body: toFormData({ payment_intent: paymentIntent, amount, reason }) }),

      // Coupons
      listCoupons: async ({ limit = 10 }) => stripeFetch(`/coupons?limit=${limit}`),
      createCoupon: async ({ percentOff, duration, durationInMonths, name }) => stripeFetch('/coupons', { method: 'POST', body: toFormData({ percent_off: percentOff, duration, duration_in_months: durationInMonths, name }) }),

      // Usage
      createUsageRecord: async ({ subscriptionItemId, quantity, action = 'increment' }) => stripeFetch(`/subscription_items/${subscriptionItemId}/usage_records`, { method: 'POST', body: toFormData({ quantity, action }) })
    };

    if (!actions[action]) {
      return Response.json({ error: 'Unknown action', available: Object.keys(actions) }, { status: 400, headers: corsHeaders });
    }

    const result = await actions[action](data || {});
    return Response.json(result, { headers: corsHeaders });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});