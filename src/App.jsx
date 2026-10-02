import { useState } from 'react'
import { CartDrawer } from './components/CartDrawer'
import { Editorial } from './components/Editorial'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Lookbook } from './components/Lookbook'
import { ProductGrid } from './components/ProductGrid'
import { OrderHistory } from './components/OrderHistory'
import { SuccessModal } from './components/SuccessModal'
import { Toast } from './components/Toast'
import { useAuth } from './auth/useAuth'
import { products } from './data/products'
import { placeOrder } from './orders/orderService'
import { useOrders } from './orders/useOrders'
import './App.css'

export default function App() {
  const [cart, setCart] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [orderComplete, setOrderComplete] = useState(false)
  const [toast, setToast] = useState('')
  const { user, loading, signInWithGoogle, signOut } = useAuth()
  const { orders, loading: ordersLoading, error: ordersError, refresh: refreshOrders } = useOrders(user)
  const displayedProducts = selectedCategory === 'All' ? products : products.filter((product) => product.type === selectedCategory)
  const itemCount = cart.reduce((total, product) => total + product.quantity, 0)
  const cartTotal = cart.reduce((total, product) => total + product.price * product.quantity, 0)
  const scrollToShop = () => document.querySelector('#shop')?.scrollIntoView({ behavior: 'smooth' })
  const addToCart = (product) => {
    setCart((items) => {
      const existing = items.find((item) => item.id === product.id)
      return existing ? items.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...items, { ...product, quantity: 1 }]
    })
    setToast(`${product.name} added to bag`)
    window.setTimeout(() => setToast(''), 2200)
  }
  const changeQuantity = (id, delta) => setCart((items) => items.flatMap((item) => item.id !== id ? [item] : item.quantity + delta < 1 ? [] : [{ ...item, quantity: item.quantity + delta }]))
  const completeCheckout = async () => {
    if (!user) { handleAuthAction(); return }
    try {
      const { emailSent } = await placeOrder(cart)
      setCart([])
      setOrderComplete(true)
      await refreshOrders()
      if (!emailSent) setToast('Your order was saved, but the confirmation email could not be sent.')
    } catch (error) {
      setToast(error.message)
    }
  }
  const handleAuthAction = async () => {
    try {
      if (user) await signOut()
      else await signInWithGoogle()
    } catch (error) {
      setToast(error.message)
    }
  }
  return <main>
    <Header itemCount={itemCount} signedIn={Boolean(user)} loading={loading} onAuthAction={handleAuthAction} onOpenCart={() => setCartOpen(true)} />
    <Hero onShop={scrollToShop} />
    <Editorial />
    <ProductGrid products={displayedProducts} selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} onAddToCart={addToCart} />
    {user && <OrderHistory orders={orders} loading={ordersLoading} error={ordersError} />}
    <Lookbook />
    <Footer />
    <Toast message={toast} />
    <CartDrawer open={cartOpen} cart={cart} itemCount={itemCount} total={cartTotal} signedIn={Boolean(user)} onClose={() => setCartOpen(false)} onQuantityChange={changeQuantity} onCheckout={completeCheckout} onShop={scrollToShop} />
    <SuccessModal open={orderComplete} onClose={() => { setOrderComplete(false); setCartOpen(false) }} />
  </main>
}
