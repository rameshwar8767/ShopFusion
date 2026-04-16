// scripts/optimizeDatabase.js
// 🚀 DATABASE OPTIMIZATION FOR MILLION+ RECORDS

const mongoose = require('mongoose');
require('dotenv').config();

const optimizeDatabase = async () => {
  try {
    console.log('🔧 Starting Database Optimization...\n');
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;

    // ========================================================
    // PRODUCTS COLLECTION OPTIMIZATION
    // ========================================================
    console.log('📦 Optimizing Products Collection...');
    
    const productsCollection = db.collection('products');
    
    // Drop existing indexes (except _id)
    await productsCollection.dropIndexes().catch(() => {});
    
    // Create optimized indexes
    await productsCollection.createIndex(
      { user: 1, productId: 1 }, 
      { unique: true, name: 'user_productId_unique' }
    );
    console.log('  ✓ Created: user + productId (unique)');

    await productsCollection.createIndex(
      { user: 1, category: 1 }, 
      { name: 'user_category' }
    );
    console.log('  ✓ Created: user + category');

    await productsCollection.createIndex(
      { user: 1, stock: 1 }, 
      { name: 'user_stock' }
    );
    console.log('  ✓ Created: user + stock (for low stock alerts)');

    await productsCollection.createIndex(
      { user: 1, name: 'text', description: 'text' }, 
      { name: 'text_search' }
    );
    console.log('  ✓ Created: text search index');

    await productsCollection.createIndex(
      { user: 1, createdAt: -1 }, 
      { name: 'user_createdAt' }
    );
    console.log('  ✓ Created: user + createdAt (for sorting)');

    // ========================================================
    // TRANSACTIONS COLLECTION OPTIMIZATION
    // ========================================================
    console.log('\n💳 Optimizing Transactions Collection...');
    
    const transactionsCollection = db.collection('transactions');
    
    await transactionsCollection.dropIndexes().catch(() => {});
    
    await transactionsCollection.createIndex(
      { user: 1, transactionId: 1 }, 
      { unique: true, name: 'user_transactionId_unique' }
    );
    console.log('  ✓ Created: user + transactionId (unique)');

    await transactionsCollection.createIndex(
      { user: 1, timestamp: -1 }, 
      { name: 'user_timestamp' }
    );
    console.log('  ✓ Created: user + timestamp (for time-based queries)');

    await transactionsCollection.createIndex(
      { user: 1, shopperId: 1 }, 
      { name: 'user_shopperId' }
    );
    console.log('  ✓ Created: user + shopperId (for customer analysis)');

    await transactionsCollection.createIndex(
      { user: 1, totalAmount: 1 }, 
      { name: 'user_totalAmount' }
    );
    console.log('  ✓ Created: user + totalAmount (for revenue queries)');

    await transactionsCollection.createIndex(
      { 'items.productId': 1 }, 
      { name: 'items_productId' }
    );
    console.log('  ✓ Created: items.productId (for product analysis)');

    // Compound index for date range + amount filtering
    await transactionsCollection.createIndex(
      { user: 1, timestamp: -1, totalAmount: 1 }, 
      { name: 'user_timestamp_amount' }
    );
    console.log('  ✓ Created: user + timestamp + amount (compound)');

    // ========================================================
    // INVENTORY LOGS COLLECTION OPTIMIZATION
    // ========================================================
    console.log('\n📊 Optimizing Inventory Logs Collection...');
    
    const inventoryLogsCollection = db.collection('inventorylogs');
    
    await inventoryLogsCollection.dropIndexes().catch(() => {});
    
    await inventoryLogsCollection.createIndex(
      { user: 1, product: 1, createdAt: -1 }, 
      { name: 'user_product_createdAt' }
    );
    console.log('  ✓ Created: user + product + createdAt');

    await inventoryLogsCollection.createIndex(
      { user: 1, changeType: 1 }, 
      { name: 'user_changeType' }
    );
    console.log('  ✓ Created: user + changeType');

    await inventoryLogsCollection.createIndex(
      { createdAt: 1 }, 
      { expireAfterSeconds: 7776000, name: 'ttl_90days' }
    );
    console.log('  ✓ Created: TTL index (90 days auto-delete)');

    // ========================================================
    // ASSOCIATION RULES COLLECTION OPTIMIZATION
    // ========================================================
    console.log('\n🤖 Optimizing Association Rules Collection...');
    
    const rulesCollection = db.collection('associationrules');
    
    await rulesCollection.dropIndexes().catch(() => {});
    
    await rulesCollection.createIndex(
      { userId: 1, lift: -1 }, 
      { name: 'userId_lift' }
    );
    console.log('  ✓ Created: userId + lift (for top rules)');

    await rulesCollection.createIndex(
      { userId: 1, confidence: -1 }, 
      { name: 'userId_confidence' }
    );
    console.log('  ✓ Created: userId + confidence');

    // ========================================================
    // USERS COLLECTION OPTIMIZATION
    // ========================================================
    console.log('\n👤 Optimizing Users Collection...');
    
    const usersCollection = db.collection('users');
    
    await usersCollection.dropIndexes().catch(() => {});
    
    await usersCollection.createIndex(
      { email: 1 }, 
      { unique: true, name: 'email_unique' }
    );
    console.log('  ✓ Created: email (unique)');

    await usersCollection.createIndex(
      { role: 1 }, 
      { name: 'role' }
    );
    console.log('  ✓ Created: role');

    // ========================================================
    // COLLECTION STATISTICS
    // ========================================================
    console.log('\n📈 Collection Statistics:');
    
    const collections = ['products', 'transactions', 'inventorylogs', 'associationrules', 'users'];
    
    for (const collName of collections) {
      const stats = await db.collection(collName).stats();
      console.log(`\n  ${collName}:`);
      console.log(`    Documents: ${stats.count.toLocaleString()}`);
      console.log(`    Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`    Indexes: ${stats.nindexes}`);
      console.log(`    Index Size: ${(stats.totalIndexSize / 1024 / 1024).toFixed(2)} MB`);
    }

    console.log('\n\n💡 Performance Recommendations:');
    console.log('  1. ✅ All indexes created successfully');
    console.log('  2. 📊 Use .lean() for read-only queries (5x faster)');
    console.log('  3. 🔄 Use bulkWrite() for batch operations');
    console.log('  4. 📦 Use aggregation pipelines for complex queries');
    console.log('  5. 🚀 Consider upgrading to MongoDB Atlas M10+ for production');
    console.log('  6. 💾 Enable Redis caching for frequently accessed data');
    console.log('  7. 📈 Monitor slow queries with MongoDB Profiler');

    console.log('\n✅ Database Optimization Complete!\n');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Optimization Error:', error);
    process.exit(1);
  }
};

optimizeDatabase();
