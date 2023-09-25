import mongoose from 'mongoose';


const MONGO_DB_NAME = "ecoDent"
const MONGO_URL = 'mongodb+srv://root:rootroot@cluster0.5qgofue.mongodb.net/?retryWrites=true&w=majority';
const connectionConfig = { dbName: MONGO_DB_NAME, autoIndex: true };
const connection = await mongoose.connect(MONGO_URL, connectionConfig);

if (connection) {
  console.log('CONNECTION with ECODENT Mongo database successfully');
} else {
  console.error('Error connecting to MongoDB database');
}


