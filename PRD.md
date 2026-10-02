# Urban Threads — Product Requirements Document

## 1. Product

Urban Threads is an online clothing shop.

## 2. Target User

Customers who want to browse and purchase clothing online.

## 3. Products

The initial catalogue contains:

- T-shirts
- Jeans
- Hoodies
- Sneakers

## 4. Authentication

Users can sign in using Google.

## 5. Shopping

Users can:

- browse products
- view product details
- add products to cart
- change quantities
- remove products
- proceed to checkout

## 6. Orders

Authenticated users can place orders.

Each order contains:

- customer
- products
- quantities
- prices
- total
- creation date

Users can view their previous orders.

## 7. Email

After successful checkout, the customer receives
a confirmation email through Mailgun.

## 8. Persistence

Orders must remain available after:

- closing the browser
- logging out
- logging back in

## 9. Database

Supabase PostgreSQL will be used.

## 10. Authentication

Google OAuth through Supabase Auth.

## 11. Deployment

The application will be deployed to Vercel.

## 12. Success Criteria

The complete production flow must work:

Sign in → Browse → Cart → Checkout → Order saved →
Confirmation email → Logout → Login → Order history.
