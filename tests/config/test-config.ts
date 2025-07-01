import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Test configuration for MagniLearn
export const testConfig = {
  baseUrl: process.env.BASE_URL || 'https://ie-learning.magnilearn.com',
  credentials: {
    username: process.env.MAGNILEARN_USERNAME || 'MM_c4437318-9019-4d89-8899-182b8110b731',
    password: process.env.MAGNILEARN_PASSWORD || '@C3T1nt3Gr4t10nPa$$w0rD'
  },
  timeouts: {
    default: 300000, // 5 minutes
    short: 10000,    // 10 seconds
    medium: 30000    // 30 seconds
  }
};

// Debug: Log the password being used (remove this in production)
console.log('Password being used:', testConfig.credentials.password); 