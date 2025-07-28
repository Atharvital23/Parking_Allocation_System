import { MongoClient } from "mongodb";

// Use MongoDB Atlas cloud; set your password in MONGODB_URI or replace <db_password>
const uri = process.env.MONGODB_URI || "mongodb+srv://ani:ani123@clusterani.r8dajhu.mongodb.net/";
const options = {};

let client;
let clientPromise;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, options);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

export default clientPromise;
