const mongoose = require('mongoose');

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://civic:civic123@cluster0.9ngdzyh.mongodb.net/civicai?retryWrites=true&w=majority';

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000,
    };

    cached.promise = mongoose.connect(mongoURI, opts).then((m) => {
      console.log(`✅ MongoDB Atlas Connected Successfully: ${m.connection.host}`);
      return m;
    }).catch(err => {
      cached.promise = null;
      console.error(`❌ MongoDB Connection Failure: ${err.message}`);
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
};

module.exports = connectDB;
