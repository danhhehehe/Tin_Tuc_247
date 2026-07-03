import mongoose from 'mongoose';

export async function connectDB(uri) {
  if (!uri) {
    throw new Error('Missing MONGODB_URI. Configure it in Render Environment Variables.');
  }

  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: Number(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS || 15000)
    });
    console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    throw error;
  }
}
