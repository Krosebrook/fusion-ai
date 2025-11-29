import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Shopify Integration - E-commerce
 * Products, Orders, Customers, Inventory, Payments
 */

Deno.serve(async (req) => {
  const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' };
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });

    const { action, data } = await req.json();
    const shopDomain = Deno.env.get('SHOPIFY_SHOP_DOMAIN');
    const accessToken = Deno.env.get('SHOPIFY_ACCESS_TOKEN');

    const shopifyFetch = async (endpoint, options = {}) => {
      const response = await fetch(`https://${shopDomain}/admin/api/2024-01${endpoint}`, {
        ...options,
        headers: { 'X-Shopify-Access-Token': accessToken, 'Content-Type': 'application/json', ...options.headers }
      });
      return response.json();
    };

    const actions = {
      // Products
      listProducts: async ({ limit = 50, status, fields }) => 
        shopifyFetch(`/products.json?limit=${limit}${status ? `&status=${status}` : ''}${fields ? `&fields=${fields}` : ''}`),
      getProduct: async ({ productId }) => shopifyFetch(`/products/${productId}.json`),
      createProduct: async ({ title, bodyHtml, vendor, productType, tags, variants, images }) => 
        shopifyFetch('/products.json', { method: 'POST', body: JSON.stringify({ product: { title, body_html: bodyHtml, vendor, product_type: productType, tags, variants, images } }) }),
      updateProduct: async ({ productId, title, bodyHtml, status }) => 
        shopifyFetch(`/products/${productId}.json`, { method: 'PUT', body: JSON.stringify({ product: { title, body_html: bodyHtml, status } }) }),
      deleteProduct: async ({ productId }) => shopifyFetch(`/products/${productId}.json`, { method: 'DELETE' }),

      // Variants
      listVariants: async ({ productId }) => shopifyFetch(`/products/${productId}/variants.json`),
      createVariant: async ({ productId, variant }) => 
        shopifyFetch(`/products/${productId}/variants.json`, { method: 'POST', body: JSON.stringify({ variant }) }),
      updateVariant: async ({ variantId, price, compareAtPrice, inventoryQuantity }) => 
        shopifyFetch(`/variants/${variantId}.json`, { method: 'PUT', body: JSON.stringify({ variant: { price, compare_at_price: compareAtPrice, inventory_quantity: inventoryQuantity } }) }),

      // Orders
      listOrders: async ({ status = 'any', limit = 50, fields }) => 
        shopifyFetch(`/orders.json?status=${status}&limit=${limit}${fields ? `&fields=${fields}` : ''}`),
      getOrder: async ({ orderId }) => shopifyFetch(`/orders/${orderId}.json`),
      updateOrder: async ({ orderId, note, tags }) => 
        shopifyFetch(`/orders/${orderId}.json`, { method: 'PUT', body: JSON.stringify({ order: { note, tags } }) }),
      cancelOrder: async ({ orderId, reason }) => 
        shopifyFetch(`/orders/${orderId}/cancel.json`, { method: 'POST', body: JSON.stringify({ reason }) }),
      closeOrder: async ({ orderId }) => 
        shopifyFetch(`/orders/${orderId}/close.json`, { method: 'POST' }),

      // Customers
      listCustomers: async ({ limit = 50, fields }) => 
        shopifyFetch(`/customers.json?limit=${limit}${fields ? `&fields=${fields}` : ''}`),
      getCustomer: async ({ customerId }) => shopifyFetch(`/customers/${customerId}.json`),
      createCustomer: async ({ email, firstName, lastName, phone, tags }) => 
        shopifyFetch('/customers.json', { method: 'POST', body: JSON.stringify({ customer: { email, first_name: firstName, last_name: lastName, phone, tags } }) }),
      updateCustomer: async ({ customerId, email, firstName, lastName, tags }) => 
        shopifyFetch(`/customers/${customerId}.json`, { method: 'PUT', body: JSON.stringify({ customer: { email, first_name: firstName, last_name: lastName, tags } }) }),
      deleteCustomer: async ({ customerId }) => shopifyFetch(`/customers/${customerId}.json`, { method: 'DELETE' }),
      searchCustomers: async ({ query, limit = 50 }) => 
        shopifyFetch(`/customers/search.json?query=${encodeURIComponent(query)}&limit=${limit}`),

      // Inventory
      getInventoryLevel: async ({ inventoryItemId, locationId }) => 
        shopifyFetch(`/inventory_levels.json?inventory_item_ids=${inventoryItemId}&location_ids=${locationId}`),
      setInventoryLevel: async ({ inventoryItemId, locationId, available }) => 
        shopifyFetch('/inventory_levels/set.json', { method: 'POST', body: JSON.stringify({ inventory_item_id: inventoryItemId, location_id: locationId, available }) }),
      adjustInventoryLevel: async ({ inventoryItemId, locationId, availableAdjustment }) => 
        shopifyFetch('/inventory_levels/adjust.json', { method: 'POST', body: JSON.stringify({ inventory_item_id: inventoryItemId, location_id: locationId, available_adjustment: availableAdjustment }) }),

      // Collections
      listCollections: async ({ limit = 50 }) => shopifyFetch(`/custom_collections.json?limit=${limit}`),
      createCollection: async ({ title, bodyHtml, image }) => 
        shopifyFetch('/custom_collections.json', { method: 'POST', body: JSON.stringify({ custom_collection: { title, body_html: bodyHtml, image } }) }),

      // Shop
      getShop: async () => shopifyFetch('/shop.json'),

      // Webhooks
      listWebhooks: async () => shopifyFetch('/webhooks.json'),
      createWebhook: async ({ topic, address, format = 'json' }) => 
        shopifyFetch('/webhooks.json', { method: 'POST', body: JSON.stringify({ webhook: { topic, address, format } }) }),
      deleteWebhook: async ({ webhookId }) => shopifyFetch(`/webhooks/${webhookId}.json`, { method: 'DELETE' })
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