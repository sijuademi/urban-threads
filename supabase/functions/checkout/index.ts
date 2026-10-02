import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const authorization = request.headers.get('Authorization')
    if (!authorization?.startsWith('Bearer ')) throw new Error('Authentication is required.')
    const token = authorization.slice(7)
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user?.email) throw new Error('Your session is invalid. Please sign in again.')
    const { items } = await request.json()
    if (!Array.isArray(items) || items.length === 0 || items.some((item) => !Number.isInteger(item.productId) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 20)) throw new Error('Your cart is invalid.')
    const quantities = new Map<number, number>()
    for (const item of items) quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity)
    if ([...quantities.values()].some((quantity) => quantity > 20)) throw new Error('A maximum of 20 units per item is allowed.')
    const productIds = [...quantities.keys()]
    const { data: products, error: productsError } = await supabase.from('products').select('id,name,price_cents').in('id', productIds).eq('active', true)
    if (productsError || products.length !== productIds.length) throw new Error('One or more products are unavailable.')
    const lineItems = products.map((product) => ({ product_id: product.id, product_name: product.name, unit_price_cents: product.price_cents, quantity: quantities.get(product.id)! }))
    const totalCents = lineItems.reduce((total, item) => total + item.unit_price_cents * item.quantity, 0)
    const { data: order, error: orderError } = await supabase.from('orders').insert({ user_id: user.id, customer_email: user.email, total_cents: totalCents }).select('id,created_at,total_cents').single()
    if (orderError) throw orderError
    const { error: itemError } = await supabase.from('order_items').insert(lineItems.map((item) => ({ ...item, order_id: order.id })))
    if (itemError) throw itemError
    const emailResponse = await sendConfirmationEmail(user.email, order.id, lineItems, totalCents)
    if (!emailResponse.ok) console.error('Order confirmation email failed', await emailResponse.text())
    return Response.json({ order, emailSent: emailResponse.ok }, { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    return Response.json({ error: error.message ?? 'Checkout failed.' }, { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})

function sendConfirmationEmail(email: string, orderId: string, items: Array<{ product_name: string; unit_price_cents: number; quantity: number }>, totalCents: number) {
  const apiKey = Deno.env.get('MAILGUN_API_KEY'), domain = Deno.env.get('MAILGUN_DOMAIN'), from = Deno.env.get('MAILGUN_FROM')
  if (!apiKey || !domain || !from) throw new Error('Mailgun is not configured.')
  const lines = items.map((item) => `${item.quantity} × ${item.product_name} — $${(item.unit_price_cents * item.quantity / 100).toFixed(2)}`).join('\n')
  const form = new FormData()
  form.set('from', from); form.set('to', email); form.set('subject', `Urban Threads order ${orderId.slice(0, 8)}`)
  form.set('text', `Thank you for your order!\n\n${lines}\n\nTotal: $${(totalCents / 100).toFixed(2)}`)
  return fetch(`${Deno.env.get('MAILGUN_API_BASE') ?? 'https://api.mailgun.net'}/v3/${domain}/messages`, { method: 'POST', headers: { Authorization: `Basic ${btoa(`api:${apiKey}`)}` }, body: form })
}
