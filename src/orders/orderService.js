import { supabase } from '../lib/supabase'

function client() {
  if (!supabase) throw new Error('Supabase is not configured yet.')
  return supabase
}

export async function placeOrder(cart) {
  const { data, error } = await client().functions.invoke('checkout', { body: { items: cart.map((item) => ({ productId: item.id, quantity: item.quantity })) } })
  if (error) throw new Error(data?.error ?? error.message)
  if (!data?.order) throw new Error('Checkout did not return an order.')
  return data
}

export async function getOrders() {
  const { data, error } = await client().from('orders').select('id, total_cents, created_at, order_items(product_name, unit_price_cents, quantity)').order('created_at', { ascending: false })
  if (error) throw error
  return data
}
