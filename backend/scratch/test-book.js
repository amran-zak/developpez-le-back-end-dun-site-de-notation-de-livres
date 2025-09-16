// scratch/test-book.js (à exécuter avec node --env-file=.env scratch/test-book.js)
import mongoose from "mongoose";
import Book from "../src/models/book.model.js";

await mongoose.connect(process.env.MONGODB_URI);

const b = await Book.create({
  userId: new mongoose.Types.ObjectId(),
  title: "Test",
  author: "Auteur",
  imageUrl: "http://localhost/images/demo.jpg",
  year: 2024,
  genre: "Fantasy",
});

await b.addRating(new mongoose.Types.ObjectId(), 5);
await b.save();

console.log("averageRating:", b.averageRating); // 5
await mongoose.disconnect();
