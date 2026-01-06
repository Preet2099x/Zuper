import mongoose from 'mongoose';

const connectDB = async () => {
    try{
        // Optimize Mongoose settings for production performance
        mongoose.set('strictQuery', false);
        
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            maxPoolSize: 20, // Increased from 10 for better concurrent connections
            minPoolSize: 5,  // Increased from 2 for faster response
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000,
            maxIdleTimeMS: 300000,
            retryWrites: true,
            w: 'majority',
            compressors: ['zlib'], // Enable compression for network traffic
        });
        
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        
        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });
        
        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB disconnected');
        });
        
        // Optimize default query behavior
        mongoose.plugin((schema) => {
            schema.set('toJSON', {
                virtuals: true,
                versionKey: false,
                transform: (doc, ret) => {
                    delete ret.__v;
                    return ret;
                }
            });
        });
    }
    catch(error){
        console.error(`MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;