import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
  throw new Error('请添加MongoDB URI到.env.local文件');
}

const MONGODB_URI = process.env.MONGODB_URI;

/**
 * 全局变量来跟踪MongoDB连接状态
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
