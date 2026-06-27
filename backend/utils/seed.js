const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Seller = require('../models/Seller');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const Order = require('../models/Order');
const Review = require('../models/Review');
const Cart = require('../models/Cart');
const AuditLog = require('../models/AuditLog');

dotenv.config();

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecart');
    console.log('Database connected for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Seller.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Coupon.deleteMany({});
    await Order.deleteMany({});
    await Review.deleteMany({});
    await Cart.deleteMany({});
    await AuditLog.deleteMany({});
    console.log('Database cleared.');

    // 1. Create Root Category (Only Electronics)
    const electronics = await Category.create({ 
      name: 'Electronics', 
      slug: 'electronics', 
      description: 'Primary marketplace directory for electronic hardware' 
    });

    console.log('Root category created.');

    // 2. Create Users
    const admin = await User.create({
      name: 'E-Cart Super Admin',
      email: 'admin@ecart.com',
      password: 'admin123',
      role: 'super_admin'
    });

    const userSeller1 = await User.create({
      name: 'John Doe (Tech Seller)',
      email: 'seller1@ecart.com',
      password: 'seller123',
      role: 'seller'
    });

    const userSeller2 = await User.create({
      name: 'Jane Smith (Gadget Seller)',
      email: 'seller2@ecart.com',
      password: 'seller123',
      role: 'seller'
    });

    const customer = await User.create({
      name: 'Alice Cooper',
      email: 'customer1@ecart.com',
      password: 'customer123',
      role: 'customer',
      walletBalance: 50000.00, // Large test balance
      addresses: [
        {
          fullName: 'Alice Cooper',
          addressLine1: '123 Main Street',
          addressLine2: 'Apt 4B',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'United States',
          phoneNumber: '5551234567',
          isDefault: true
        }
      ]
    });

    console.log('Actors seeded.');

    // 3. Create Seller Profiles
    const seller1 = await Seller.create({
      user: userSeller1._id,
      storeName: 'GizmoLabs Technology',
      storeDescription: 'Premium laptops, computers, and cellular devices retailer.',
      kycStatus: 'approved',
      commissionRate: 0.08,
      payoutDetails: {
        bankName: 'National Bank',
        accountNumber: '1234567890',
        upiId: 'gizmolabs@upi'
      }
    });

    const seller2 = await Seller.create({
      user: userSeller2._id,
      storeName: 'CyberPlay Electronics',
      storeDescription: 'Authorized gaming hardware and audio electronics distributor.',
      kycStatus: 'approved',
      commissionRate: 0.10,
      payoutDetails: {
        bankName: 'Union Bank',
        accountNumber: '0987654321',
        upiId: 'cyberplay@upi'
      }
    });

    console.log('Seller profiles created.');

    // 70 categories requested by the user
    const categoryNames = [
      "Smartphone", "Tablet", "Laptop", "Desktop Computer", "Smartwatch", "Fitness Band",
      "Wireless Earbuds", "Headphones", "In-Ear Earphones", "Bluetooth Speaker", "Home Theater System",
      "Smart TV", "LED TV", "Digital Camera", "DSLR Camera", "Mirrorless Camera", "Action Camera",
      "Camera Lens", "Power Bank", "Mobile Charger", "Charging Cable", "Memory Card", "USB Flash Drive",
      "External Hard Drive", "SSD", "Computer Monitor", "Keyboard", "Mouse", "Webcam", "Printer",
      "Scanner", "Wi-Fi Router", "Modem", "Gaming Console", "Gaming Controller", "VR Headset", "Drone",
      "Projector", "Microphone", "Graphics Card", "Processor", "RAM", "Motherboard", "PC Cabinet",
      "Power Supply Unit", "Cooling Fan", "Air Conditioner", "Refrigerator", "Washing Machine",
      "Microwave Oven", "Air Purifier", "Vacuum Cleaner", "Electric Iron", "Hair Dryer", "Trimmer",
      "Electric Shaver", "Calculator", "Walkie Talkie", "Car Stereo", "Dash Camera", "Set-Top Box",
      "Streaming Media Player", "Smart Home Speaker", "Security Camera", "Video Doorbell", "Inverter",
      "UPS", "Battery", "Power Strip", "Travel Adapter"
    ];

    // Helper mapping for realistic brand/model generator
    const getProductInfo = (catName, idx) => {
      let brand = 'Generic';
      let model = `Model-${idx}`;
      const cn = catName.toLowerCase();
      
      if (cn.includes('smartphone')) {
        const brands = ['Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi', 'Sony', 'Oppo', 'Vivo', 'Motorola', 'Realme'];
        const models = ['iPhone 15 Pro Max', 'Galaxy S24 Ultra', 'Pixel 8 Pro', 'OnePlus 12', 'Xiaomi 14 Pro', 'Xperia 1 V', 'Find X7 Ultra', 'X40 Pro', 'Edge 50 Ultra', 'GT 5 Pro'];
        brand = brands[idx % brands.length];
        model = models[idx % models.length];
      } else if (cn.includes('tablet')) {
        const brands = ['Apple', 'Samsung', 'Lenovo', 'Xiaomi', 'Huawei'];
        const models = ['iPad Pro M4', 'Galaxy Tab S9 Ultra', 'Tab P12 Pro', 'Pad 6 Max', 'MatePad Pro'];
        brand = brands[idx % brands.length];
        model = models[idx % models.length];
      } else if (cn.includes('laptop')) {
        const brands = ['Apple', 'Dell', 'Lenovo', 'HP', 'ASUS', 'Razer', 'Acer', 'Microsoft'];
        const models = ['MacBook Pro M3', 'XPS 15 OLED', 'ThinkPad X1 Carbon', 'Spectre x360', 'ROG Zephyrus G14', 'Blade 16', 'Swift Edge', 'Surface Laptop 5'];
        brand = brands[idx % brands.length];
        model = models[idx % models.length];
      } else if (cn.includes('smartwatch')) {
        const brands = ['Apple', 'Samsung', 'Garmin', 'Fitbit', 'Fossil', 'Amazfit'];
        const models = ['Watch Ultra 2', 'Galaxy Watch 6', 'Fenix 7 Solar', 'Sense 2', 'Gen 6 Wellness', 'GTR 4'];
        brand = brands[idx % brands.length];
        model = models[idx % models.length];
      } else if (cn.includes('earbuds') || cn.includes('headphones') || cn.includes('earphones')) {
        const brands = ['Sony', 'Bose', 'Apple', 'Sennheiser', 'JBL', 'Anker', 'Beats'];
        const models = ['WF-1000XM5 buds', 'QuietComfort Ultra', 'AirPods Pro 2', 'Momentum True Wireless 4', 'Reflect Flow Pro', 'Soundcore Liberty 4', 'Studio Buds+'];
        brand = brands[idx % brands.length];
        model = models[idx % models.length];
      } else if (cn.includes('speaker') || cn.includes('theater')) {
        const brands = ['JBL', 'Bose', 'Sonos', 'Sony', 'Harman Kardon', 'Marshall'];
        const models = ['Flip 6 Portable', 'SoundLink Revolve+', 'Era 300 Speaker', 'SRS-XG300', 'Onyx Studio 8', 'Stanmore III'];
        brand = brands[idx % brands.length];
        model = models[idx % models.length];
      } else if (cn.includes('tv')) {
        const brands = ['Samsung', 'LG', 'Sony', 'TCL', 'Hisense'];
        const models = ['Neo QLED 8K', 'OLED C3 Series', 'Bravia XR A90J', 'QM8 Mini-LED', 'U8K QLED'];
        brand = brands[idx % brands.length];
        model = models[idx % models.length];
      } else if (cn.includes('camera') || cn.includes('lens')) {
        const brands = ['Canon', 'Nikon', 'Sony', 'Fujifilm', 'GoPro', 'DJI'];
        const models = ['EOS R5 DSLR', 'Z9 Mirrorless', 'Alpha 7 IV', 'X-T5 Camera', 'Hero 12 Action', 'Osmo Action 4'];
        brand = brands[idx % brands.length];
        model = models[idx % models.length];
      } else if (cn.includes('ssd') || cn.includes('hard drive') || cn.includes('flash drive') || cn.includes('memory card')) {
        const brands = ['Samsung', 'SanDisk', 'Crucial', 'Kingston', 'WD', 'Seagate'];
        const models = ['990 PRO NVMe SSD', 'Extreme Portable SSD', 'T7 Shield', 'DataTraveler Max', 'My Passport HDD', 'IronWolf Pro'];
        brand = brands[idx % brands.length];
        model = models[idx % models.length];
      } else if (cn.includes('monitor')) {
        const brands = ['ASUS', 'Dell', 'LG', 'Samsung', 'BenQ', 'Gigabyte'];
        const models = ['ROG Swift OLED', 'Ultrasharp U2723QE', 'UltraGear 27GP850', 'Odyssey Neo G9', 'MOBIUZ EX2710Q', 'Aorus FI32U'];
        brand = brands[idx % brands.length];
        model = models[idx % models.length];
      } else if (cn.includes('keyboard') || cn.includes('mouse') || cn.includes('webcam')) {
        const brands = ['Logitech', 'Razer', 'Corsair', 'Keychron', 'SteelSeries'];
        const models = ['MX Master 3S Mouse', 'DeathAdder V3 Pro', 'K100 RGB Keyboard', 'K8 Mechanical Keyboard', 'Brio 4K Webcam', 'Apex Pro TKL'];
        brand = brands[idx % brands.length];
        model = models[idx % models.length];
      } else if (cn.includes('console') || cn.includes('controller') || cn.includes('vr headset')) {
        const brands = ['Sony', 'Microsoft', 'Nintendo', 'Meta', 'ASUS'];
        const models = ['PlayStation 5 Disc', 'Xbox Series X', 'Nintendo Switch OLED', 'Quest 3 VR', 'ROG Ally Handheld'];
        brand = brands[idx % brands.length];
        model = models[idx % models.length];
      } else if (cn.includes('processor') || cn.includes('graphics card') || cn.includes('ram') || cn.includes('motherboard')) {
        const brands = ['Intel', 'AMD', 'NVIDIA', 'ASUS', 'Corsair', 'G.Skill', 'MSI'];
        const models = ['Core i9-14900K', 'Ryzen 7 7800X3D', 'GeForce RTX 4090', 'ROG Maximus Z790', 'Vengeance DDR5 32GB', 'Trident Z5 Neo', 'GeForce RTX 4070 Ti'];
        brand = brands[idx % brands.length];
        model = models[idx % models.length];
      } else if (cn.includes('router') || cn.includes('modem') || cn.includes('wi-fi')) {
        const brands = ['Netgear', 'TP-Link', 'Linksys', 'ASUS', 'Ubiquiti'];
        const models = ['Nighthawk AX12', 'Deco XE75 Mesh', 'Velop Pro 6E', 'ROG Rapture GT6', 'UniFi Dream Router'];
        brand = brands[idx % brands.length];
        model = models[idx % models.length];
      } else {
        const brands = ['Samsung', 'LG', 'Panasonic', 'Philips', 'Dyson', 'Xiaomi', 'Sony', 'Anker', 'Belkin'];
        const models = ['Smart Air Purifier', 'Inverter AC Elite', 'Double-Door Fridge', 'Front-Load Washer', 'Steam Electric Iron', 'Compact Hair Dryer', 'Vacuum V15 Detect', 'Multi-Trimmer 9000', 'Scientific Calculator'];
        brand = brands[idx % brands.length];
        model = models[idx % models.length];
      }

      return { brand, model };
    };

    const getCategoryImage = (catName) => {
      const cn = catName.toLowerCase();
      if (cn.includes('phone') || cn.includes('smartphone') || cn.includes('tablet')) {
        return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=60';
      }
      if (cn.includes('laptop') || cn.includes('computer') || cn.includes('monitor')) {
        return 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&auto=format&fit=crop&q=60';
      }
      if (cn.includes('watch') || cn.includes('band')) {
        return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60';
      }
      if (cn.includes('earbuds') || cn.includes('headphones') || cn.includes('speaker') || cn.includes('audio')) {
        return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60';
      }
      if (cn.includes('camera') || cn.includes('lens')) {
        return 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&auto=format&fit=crop&q=60';
      }
      if (cn.includes('game') || cn.includes('console') || cn.includes('controller') || cn.includes('vr')) {
        return 'https://images.unsplash.com/photo-1606813907291-d86edd9b94db?w=500&auto=format&fit=crop&q=60';
      }
      return 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=60';
    };

    console.log(`Generating ${categoryNames.length} categories under Electronics...`);
    
    for (const catName of categoryNames) {
      const slug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const catDoc = await Category.create({
        name: catName,
        slug,
        parent: electronics._id
      });

      // Generate 10 products per category
      for (let j = 0; j < 10; j++) {
        const { brand, model } = getProductInfo(catName, j);
        const title = `${brand} ${model}`;
        const basePrice = 50 + (j * 40);
        const targetSeller = j % 2 === 0 ? seller1._id : seller2._id;

        await Product.create({
          seller: targetSeller,
          title,
          description: `High-performance ${title} ${catName}. Engineered with advanced specifications, premium build quality, and optimized for maximum reliability and battery cycles.`,
          category: catDoc._id,
          brand,
          images: [getCategoryImage(catName)],
          variants: [
            { sku: `SKU-${slug}-${j}-STD`, price: basePrice, stock: 15 + j, attributes: { color: 'Carbon Black', size: 'Standard' } },
            { sku: `SKU-${slug}-${j}-PRO`, price: basePrice + 60, stock: 8 + j, attributes: { color: 'Titanium Grey', size: 'Pro Edition' } }
          ],
          ratingsSummary: {
            averageRating: 4.0 + (j % 2 === 0 ? 0.8 : 0.2),
            totalReviews: 2 + j
          }
        });
      }
    }

    console.log(`Seeded ${categoryNames.length} subcategories and ${categoryNames.length * 10} products.`);

    // 5. Create Coupons
    await Coupon.create({
      code: 'WELCOME10',
      discountType: 'percentage',
      discountAmount: 10,
      minOrderValue: 50,
      startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      maxUses: 1000
    });

    await Coupon.create({
      code: 'ECART50',
      discountType: 'fixed',
      discountAmount: 50,
      minOrderValue: 200,
      startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      maxUses: 500
    });

    console.log('Coupons seeded.');
    console.log('Seeding process complete! Exiting...');
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedData();
