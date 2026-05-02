import dotenv from 'dotenv';
import path from 'path';

// Load .env file for tests - go up from src/test/ to server root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
