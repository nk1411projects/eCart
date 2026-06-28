const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');
const nodemailer = require('nodemailer');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

const allowedOrigin = (process.env.CLIENT_URL || 'https://nk-ecart.vercel.app/').replace(/\/$/, '');

const corsOptions = {
  origin: allowedOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

// Mount routers
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/categories', require('./routes/categoryRoutes'));
app.use('/api/v1/products', require('./routes/productRoutes'));
app.use('/api/v1/cart', require('./routes/cartRoutes'));
app.use('/api/v1/orders', require('./routes/orderRoutes'));
app.use('/api/v1/seller', require('./routes/sellerRoutes'));
app.use('/api/v1/admin', require('./routes/adminRoutes'));

// Basic health check route
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, status: 'healthy', timestamp: new Date() });
});

// Support / Contact route
app.post('/api/v1/support/contact', async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    
    const targetEmail = process.env.SUPPORT_EMAIL || 'support@ecart.com';
    
    // Check if SMTP is configured
    let emailSent = false;
    let customStatus = '';
    
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });
        
        await transporter.sendMail({
          from: `"${name}" <${process.env.SMTP_USER}>`,
          to: targetEmail,
          replyTo: email,
          subject: `eCart Support: ${subject}`,
          text: `Support request received from eCart:\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`
        });
        emailSent = true;
        customStatus = 'Email dispatched successfully via SMTP.';
      } catch (mailError) {
        console.error('Mail dispatch error:', mailError.message);
        customStatus = `SMTP dispatch failed: ${mailError.message}. Logging fallback...`;
      }
    } else {
      customStatus = 'SMTP user/pass not configured. Logged to console instead.';
    }

    console.log(`\n==================================================`);
    console.log(`[CONTACT EMAIL PROCESSOR]`);
    console.log(`To: ${targetEmail}`);
    console.log(`From: ${email} (${name}) | Subject: ${subject}`);
    console.log(`Status: ${customStatus}`);
    console.log(`[BODY] ${message}`);
    console.log(`==================================================\n`);

    res.status(200).json({
      success: true,
      message: emailSent 
        ? 'Your support ticket has been sent successfully.' 
        : `Your ticket has been logged. Note: ${customStatus}`
    });
  } catch (error) {
    next(error);
  }
});

// Centralized error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
