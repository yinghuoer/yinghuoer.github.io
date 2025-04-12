import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('请添加MongoDB URI到.env.local文件');
}

const uri = process.env.MONGODB_URI;
const options = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
};

let client;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // 在开发模式下重用MongoDB连接
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options as any);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // 在生产模式下创建新的MongoDB连接
  client = new MongoClient(uri, options as any);
  clientPromise = client.connect();
}

export default clientPromise;
