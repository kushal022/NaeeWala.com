import mongoose from "mongoose";


export const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) throw new Error("MONGO_URI is not defined");

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection.asPromise();
  }

  try {
    await mongoose.connect(MONGO_URI );
    console.log("✅---- MongoDB connected ----✅");
  } catch (err) {
    console.error(err);
  }
};



// import mongoose from "mongoose";

// const MONGO_URI = process.env.MONGO_URI;

// if (!MONGO_URI) throw new Error("MONGO_URI is not defined");

// let cached = global.mongoose;
// if (!cached) {
//   cached = global.mongoose = { conn: null, promise: null };
// }

// export async function dbConnect() {
//   if (cached.conn) return cached.conn;
//   if (!cached.promise) {
//     cached.promise = mongoose.connect(MONGO_URI, {
//       // useNewUrlParser: true, useUnifiedTopology: true
//     }).then((m) => m);
//   }
//   cached.conn = await cached.promise;
//   return cached.conn;
// }
