// In-memory database (replace with MongoDB/PostgreSQL in production)
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const db = {
  users: [],
  products: [],
  orders: [],
  reviews: [],
  categories: [],
  carts: [],
  wishlists: [],
};

// Seed initial data
async function seedDatabase() {
  // Categories
  db.categories = [
    { id: 'cat-1', name: 'Electronics', slug: 'electronics', icon: '💻', description: 'Latest gadgets and electronics', productCount: 0 },
    { id: 'cat-2', name: 'Fashion', slug: 'fashion', icon: '👗', description: 'Trendy clothes and accessories', productCount: 0 },
    { id: 'cat-3', name: 'Home & Living', slug: 'home-living', icon: '🏠', description: 'Furniture and home decor', productCount: 0 },
    { id: 'cat-4', name: 'Sports', slug: 'sports', icon: '⚽', description: 'Sports equipment and gear', productCount: 0 },
    { id: 'cat-5', name: 'Books', slug: 'books', icon: '📚', description: 'Books and educational material', productCount: 0 },
    { id: 'cat-6', name: 'Beauty', slug: 'beauty', icon: '💄', description: 'Skincare and beauty products', productCount: 0 },
  ];

  // Products
  db.products = [
    {
      id: 'prod-1', name: 'MacBook Pro 16"', slug: 'macbook-pro-16',
      description: 'Powerful laptop with M3 Pro chip, 18GB RAM, 512GB SSD. Perfect for professionals and creators.',
      price: 2499.99, originalPrice: 2799.99, discount: 11,
      category: 'cat-1', categoryName: 'Electronics',
      stock: 15, sold: 234,
      images: [
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80',
        'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600&q=80',
      ],
      rating: 4.8, reviewCount: 128,
      tags: ['laptop', 'apple', 'macbook', 'pro'],
      specs: { processor: 'Apple M3 Pro', ram: '18GB', storage: '512GB SSD', display: '16.2" Liquid Retina XDR' },
      featured: true, isNew: false, isBestSeller: true,
      createdAt: new Date('2024-01-15'),
    },
    {
      id: 'prod-2', name: 'Sony WH-1000XM5 Headphones', slug: 'sony-wh1000xm5',
      description: 'Industry-leading noise canceling wireless headphones with 30-hour battery life.',
      price: 279.99, originalPrice: 349.99, discount: 20,
      category: 'cat-1', categoryName: 'Electronics',
      stock: 42, sold: 891,
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
        'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&q=80',
      ],
      rating: 4.7, reviewCount: 342,
      tags: ['headphones', 'sony', 'wireless', 'noise-canceling'],
      specs: { battery: '30 hours', connectivity: 'Bluetooth 5.2', weight: '250g', driver: '30mm' },
      featured: true, isNew: false, isBestSeller: true,
      createdAt: new Date('2024-01-20'),
    },
    {
      id: 'prod-3', name: 'iPhone 15 Pro Max', slug: 'iphone-15-pro-max',
      description: 'The most advanced iPhone ever with titanium design, A17 Pro chip, and 5x zoom camera.',
      price: 1199.99, originalPrice: 1199.99, discount: 0,
      category: 'cat-1', categoryName: 'Electronics',
      stock: 28, sold: 567,
      images: [
        'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&q=80',
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&q=80',
      ],
      rating: 4.9, reviewCount: 892,
      tags: ['iphone', 'apple', 'smartphone', '5g'],
      specs: { chip: 'A17 Pro', storage: '256GB', camera: '48MP + 12MP + 12MP', display: '6.7" Super Retina XDR' },
      featured: true, isNew: true, isBestSeller: true,
      createdAt: new Date('2024-02-01'),
    },
    {
      id: 'prod-4', name: 'Samsung 4K OLED TV 65"', slug: 'samsung-4k-oled-65',
      description: 'Stunning 4K OLED display with 144Hz refresh rate. Transform your home entertainment.',
      price: 1799.99, originalPrice: 2299.99, discount: 22,
      category: 'cat-1', categoryName: 'Electronics',
      stock: 8, sold: 123,
      images: [
        'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600&q=80',
      ],
      rating: 4.6, reviewCount: 89,
      tags: ['tv', 'samsung', 'oled', '4k'],
      specs: { display: '65" OLED 4K', refreshRate: '144Hz', hdmi: 'HDMI 2.1 x4', smartOS: 'Tizen' },
      featured: false, isNew: false, isBestSeller: false,
      createdAt: new Date('2024-01-10'),
    },
    {
      id: 'prod-5', name: 'Nike Air Max 2024', slug: 'nike-air-max-2024',
      description: 'The latest Air Max with revolutionary cushioning technology for ultimate comfort.',
      price: 149.99, originalPrice: 179.99, discount: 17,
      category: 'cat-2', categoryName: 'Fashion',
      stock: 65, sold: 1203,
      images: [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
        'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80',
      ],
      rating: 4.5, reviewCount: 567,
      tags: ['nike', 'shoes', 'sneakers', 'air-max'],
      specs: { material: 'Mesh/Synthetic', sole: 'Air Max cushioning', sizes: '6-14', colors: 'Black, White, Red' },
      featured: true, isNew: true, isBestSeller: false,
      createdAt: new Date('2024-02-10'),
    },
    {
      id: 'prod-6', name: 'Premium Leather Jacket', slug: 'premium-leather-jacket',
      description: 'Genuine Italian leather jacket with asymmetric zip. A timeless wardrobe staple.',
      price: 349.99, originalPrice: 499.99, discount: 30,
      category: 'cat-2', categoryName: 'Fashion',
      stock: 23, sold: 312,
      images: [
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80',
      ],
      rating: 4.4, reviewCount: 134,
      tags: ['jacket', 'leather', 'fashion', 'premium'],
      specs: { material: 'Genuine Italian Leather', lining: 'Polyester', sizes: 'XS-XXL', care: 'Dry Clean Only' },
      featured: false, isNew: false, isBestSeller: false,
      createdAt: new Date('2024-01-05'),
    },
    {
      id: 'prod-7', name: 'Ergonomic Office Chair', slug: 'ergonomic-office-chair',
      description: 'Premium ergonomic chair with lumbar support, adjustable armrests, and breathable mesh back.',
      price: 449.99, originalPrice: 599.99, discount: 25,
      category: 'cat-3', categoryName: 'Home & Living',
      stock: 19, sold: 456,
      images: [
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80',
      ],
      rating: 4.6, reviewCount: 234,
      tags: ['chair', 'ergonomic', 'office', 'furniture'],
      specs: { material: 'Mesh/Foam', maxWeight: '300 lbs', adjustment: 'Height, Armrests, Tilt', warranty: '5 years' },
      featured: true, isNew: false, isBestSeller: false,
      createdAt: new Date('2024-01-12'),
    },
    {
      id: 'prod-8', name: 'Minimalist Desk Lamp', slug: 'minimalist-desk-lamp',
      description: 'LED desk lamp with wireless charging base, touch controls, and color temperature adjustment.',
      price: 79.99, originalPrice: 99.99, discount: 20,
      category: 'cat-3', categoryName: 'Home & Living',
      stock: 87, sold: 678,
      images: [
        'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80',
      ],
      rating: 4.3, reviewCount: 312,
      tags: ['lamp', 'led', 'desk', 'wireless-charging'],
      specs: { wattage: '12W LED', colorTemp: '2700K-6500K', charging: '10W Wireless', lifespan: '50,000 hours' },
      featured: false, isNew: true, isBestSeller: false,
      createdAt: new Date('2024-02-05'),
    },
    {
      id: 'prod-9', name: 'Yoga Mat Premium', slug: 'yoga-mat-premium',
      description: 'Eco-friendly non-slip yoga mat with alignment lines. 6mm thick for joint protection.',
      price: 68.99, originalPrice: 89.99, discount: 23,
      category: 'cat-4', categoryName: 'Sports',
      stock: 134, sold: 1567,
      images: [
        'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&q=80',
      ],
      rating: 4.7, reviewCount: 789,
      tags: ['yoga', 'mat', 'fitness', 'eco-friendly'],
      specs: { material: 'Natural Rubber', thickness: '6mm', size: '72" x 26"', weight: '2.5 lbs' },
      featured: false, isNew: false, isBestSeller: true,
      createdAt: new Date('2024-01-08'),
    },
    {
      id: 'prod-10', name: 'JavaScript: The Good Parts', slug: 'javascript-good-parts',
      description: 'The definitive guide to JavaScript best practices by Douglas Crockford.',
      price: 24.99, originalPrice: 34.99, discount: 29,
      category: 'cat-5', categoryName: 'Books',
      stock: 200, sold: 3421,
      images: [
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80',
      ],
      rating: 4.8, reviewCount: 1234,
      tags: ['javascript', 'programming', 'books', 'coding'],
      specs: { author: 'Douglas Crockford', pages: '172', publisher: "O'Reilly", isbn: '978-0596517748' },
      featured: false, isNew: false, isBestSeller: true,
      createdAt: new Date('2024-01-01'),
    },
    {
      id: 'prod-11', name: 'Luxury Skincare Set', slug: 'luxury-skincare-set',
      description: 'Complete 5-step skincare routine with vitamin C serum, retinol, and SPF 50 moisturizer.',
      price: 189.99, originalPrice: 249.99, discount: 24,
      category: 'cat-6', categoryName: 'Beauty',
      stock: 45, sold: 892,
      images: [
        'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80',
      ],
      rating: 4.6, reviewCount: 456,
      tags: ['skincare', 'beauty', 'vitamin-c', 'luxury'],
      specs: { skinType: 'All skin types', includes: '5 products', volume: '30ml each', crueltyFree: true },
      featured: true, isNew: true, isBestSeller: false,
      createdAt: new Date('2024-02-08'),
    },
    {
      id: 'prod-12', name: 'Apple Watch Series 9', slug: 'apple-watch-series-9',
      description: 'The most advanced Apple Watch with Double Tap gesture and precision finding.',
      price: 399.99, originalPrice: 399.99, discount: 0,
      category: 'cat-1', categoryName: 'Electronics',
      stock: 31, sold: 678,
      images: [
        'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=80',
      ],
      rating: 4.7, reviewCount: 345,
      tags: ['apple', 'watch', 'smartwatch', 'wearable'],
      specs: { display: '45mm Always-On', health: 'ECG, Blood Oxygen', battery: '18 hours', waterproof: '50m' },
      featured: true, isNew: true, isBestSeller: false,
      createdAt: new Date('2024-02-12'),
    },
  ];

  // Update category counts
  db.products.forEach(p => {
    const cat = db.categories.find(c => c.id === p.category);
    if (cat) cat.productCount++;
  });

  // Admin user
  const adminPassword = await bcrypt.hash('Admin@123456', 10);
  db.users = [
    {
      id: 'user-admin',
      name: 'Admin User',
      email: 'admin@shopwave.com',
      password: adminPassword,
      role: 'admin',
      avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=0f172a&color=fff',
      phone: '+1 (555) 000-0001',
      addresses: [{
        id: 'addr-1', name: 'Admin User', street: '123 Admin St',
        city: 'San Francisco', state: 'CA', zip: '94102', country: 'US', isDefault: true
      }],
      createdAt: new Date('2024-01-01'),
      isActive: true,
    }
  ];

  // Sample reviews
  db.reviews = [
    { id: 'rev-1', productId: 'prod-1', userId: 'user-admin', userName: 'Admin User', rating: 5, comment: 'Absolutely incredible machine. The M3 Pro chip handles everything I throw at it.', createdAt: new Date('2024-02-01'), helpful: 23 },
    { id: 'rev-2', productId: 'prod-2', userId: 'user-admin', userName: 'Admin User', rating: 5, comment: 'Best noise canceling headphones I have ever owned. Perfect for flights.', createdAt: new Date('2024-02-05'), helpful: 45 },
  ];

  console.log('✅ Database seeded successfully');
}

seedDatabase();

module.exports = db;
