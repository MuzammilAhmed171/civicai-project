const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://civic:civic123@cluster0.9ngdzyh.mongodb.net/civicai?retryWrites=true&w=majority';
  
  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 15000
    });
    console.log(`✅ MongoDB Atlas Connected Successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Failure: ${error.message}`);
  }
};

module.exports = connectDB;
