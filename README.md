# The 404 Store

A modern e-commerce application built with Next.js 15, featuring a unique "not found" aesthetic and complete shopping functionality.

## 🛍️ Features

- **Product Catalog**: Browse products by category (Shirt, Tshirt, Jeans, Newdrop, Sale)
- **User Authentication**: Secure sign-up/login system with role-based access
- **Shopping Cart**: Add items, manage quantities, apply coupons
- **Checkout System**: Complete checkout flow with shipping information
- **Order Tracking**: Track order status and delivery
- **Admin Panel**: Product management, coupon creation, order management
- **Loyalty Program**: Earn points on purchases, redeem for discounts
- **Wishlist**: Save favorite items
- **Account Management**: View order history, manage profile
- **About Page**: Team information and brand story

## 🚀 Tech Stack

- **Frontend**: Next.js 15, React 18, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB (Atlas cloud)
- **Authentication**: Custom JWT-based auth
- **Styling**: Tailwind CSS, Radix UI components
- **State Management**: React hooks, localStorage

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/SomnathBiswas/the404store.git
cd the404store
```

2. Install dependencies:
```bash
yarn install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
MONGO_URL=mongodb+srv://your-connection-string
DB_NAME=four_o_four_store
NEXT_PUBLIC_BASE_URL=http://localhost:3000
CORS_ORIGINS=*
ADMIN_EMAIL=admin@404store.com
ADMIN_PASSWORD=your-hashed-password
AUTH_SECRET=your-secret-key
```

**Important**: For security, the admin password should be hashed using bcrypt. Run this command to generate a hashed password:
```bash
node scripts/hash-admin-password.js your-secure-password
```
Then copy the output hash to your `.env` file as `ADMIN_PASSWORD`.

4. Run the development server:
```bash
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🌐 Production Build

```bash
yarn build
yarn start
```

## 👥 Team

- **Somnath** - Founder & Creative Director ([@_somnath2_](https://www.instagram.com/_somnath2_/))
- **Sudip** - Head of Operations ([@suddiixz](https://www.instagram.com/suddiixz/))
- **Sohaib** - Digital Strategist ([@sohaibians_sw](https://www.instagram.com/sohaibians_sw/))

## 🔧 Admin Access

Access the admin panel at `/admin` using credentials from your `.env` file:
- Email: `ADMIN_EMAIL` from environment variables
- Password: `ADMIN_PASSWORD` from environment variables

**Note**: Admin credentials are completely separate from regular user authentication for security.

## 📝 API Endpoints

### Public
- `GET /api/products` - Get all products
- `GET /api/products/:slug` - Get product details
- `POST /api/auth/signup` - Create user account
- `POST /api/auth/login` - User login
- `POST /api/orders` - Place order (requires auth)
- `GET /api/track/:id` - Track order (public)

### Admin (Requires admin authentication)
- `POST /api/admin/login` - Admin login
- `GET /api/admin/products` - Get all products
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/:slug` - Update product
- `DELETE /api/admin/products/:slug` - Delete product
- `GET /api/admin/coupons` - Get all coupons
- `POST /api/admin/coupons` - Create coupon
- `GET /api/admin/orders` - Get all orders
- `PUT /api/admin/orders/:id` - Update order status
- `GET /api/admin/users` - Get all users
- `GET /api/admin/stats` - Get dashboard statistics

## 🎨 Features Overview

### Shopping Experience
- Product filtering by category
- Search functionality
- Size and quantity selection
- Product images with hover effects
- Related product recommendations

### Cart & Checkout
- Real-time cart updates
- Coupon code application
- Loyalty points redemption (100 pts = ₹25)
- Shipping address form
- Order confirmation and tracking

### User Features
- Account creation and login
- Order history
- Wishlist management
- Loyalty points tracking
- Profile management

### Admin Features
- Product management with image upload
- Coupon creation and management
- Order status management
- User management
- Dashboard statistics

## 🔐 Security

- JWT-based authentication
- Separate admin authentication system
- Role-based access control
- Password hashing with bcrypt
- Environment variable protection
- CORS configuration

## 📱 Responsive Design

- Mobile-first approach
- Optimized for desktop, tablet, and mobile
- Touch-friendly interface
- Fast loading times

## 🎯 Brand Identity

The 404 Store represents style that "doesn't follow conventional patterns." The design features:
- Bold typography
- High-contrast color scheme (black, white, red accents)
- Edgy, unconventional aesthetic
- "Not found" theme throughout

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is proprietary software. All rights reserved.

## 📞 Contact

For inquiries, reach out to the team via Instagram or email at admin@404store.com

---

**Made for the not found** © 2026 The 404 Store