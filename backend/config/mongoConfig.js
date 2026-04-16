// config/mongoConfig.js
// 🚀 MONGODB CONFIGURATION FOR UNLIMITED SCALABILITY

const mongoose = require('mongoose');

/**
 * Optimized MongoDB connection for handling billions of records
 */
const connectDB = async () => {
  try {
    const options = {
      // Connection Pool Settings (Critical for high throughput)
      maxPoolSize: 100,        // Max 100 concurrent connections
      minPoolSize: 10,         // Keep 10 connections always ready
      
      // Timeout Settings (For large operations)
      serverSelectionTimeoutMS: 30000,  // 30 seconds
      socketTimeoutMS: 0,                // No timeout for long operations
      connectTimeoutMS: 30000,           // 30 seconds to establish connection
      
      // Write Concern (Optimized for speed)
      w: 1,                     // Acknowledge writes from primary only
      journal: false,           // Don't wait for journal sync (faster)
      
      // Read Preference
      readPreference: 'primaryPreferred',
      
      // Compression (Reduce network traffic)
      compressors: ['zlib'],
      zlibCompressionLevel: 6,
      
      // Auto Index
      autoIndex: false,         // Don't auto-create indexes (we do it manually)
      
      // Buffering
      bufferCommands: false,    // Fail fast if not connected
      
      // Monitoring
      heartbeatFrequencyMS: 10000,  // Check server health every 10s
      
      // Retry Logic
      retryWrites: true,
      retryReads: true,
      
      // Family (IPv4)
      family: 4
    };

    const conn = await mongoose.connect(process.env.MONGO_URI, options);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Connection Pool: ${options.maxPoolSize} connections`);
    console.log(`🚀 Optimized for unlimited scalability`);

    // Monitor connection events
    mongoose.connection.on('connected', () => {
      console.log('✅ Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  Mongoose disconnected from MongoDB');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

/**
 * Get database statistics
 */
const getDBStats = async () => {
  try {
    const db = mongoose.connection.db;
    const stats = await db.stats();
    
    return {
      database: db.databaseName,
      collections: stats.collections,
      dataSize: `${(stats.dataSize / 1024 / 1024 / 1024).toFixed(2)} GB`,
      storageSize: `${(stats.storageSize / 1024 / 1024 / 1024).toFixed(2)} GB`,
      indexes: stats.indexes,
      indexSize: `${(stats.indexSize / 1024 / 1024).toFixed(2)} MB`,
      objects: stats.objects.toLocaleString()
    };
  } catch (error) {
    console.error('Error getting DB stats:', error);
    return null;
  }
};

/**
 * Optimize MongoDB for bulk operations
 */
const optimizeForBulkOps = () => {
  // Increase default batch size
  mongoose.set('bufferCommands', false);
  mongoose.set('bufferTimeoutMS', 30000);
  
  // Disable automatic index creation
  mongoose.set('autoIndex', false);
  
  // Set strict mode
  mongoose.set('strict', true);
  mongoose.set('strictQuery', false);
  
  console.log('✅ MongoDB optimized for bulk operations');
};

module.exports = {
  connectDB,
  getDBStats,
  optimizeForBulkOps
};
