import mongoose from "mongoose";

const MONGODB_URI = "mongodb://localhost:27017/keyframe";

async function test() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  const questions = await db.collection("questions").find({}).toArray();
  
  questions.forEach(q => {
    console.log(`ID: ${q._id}`);
    console.log(`Title: ${q.title}`);
    console.log(`Body: ${q.body.substring(0, 100)}...`);
    console.log("---");
  });
  
  mongoose.disconnect();
}

test();
