import Book from "../models/book.model.js";
import { deleteImageByUrl } from "../middleware/image-processor.js";

/** GET /api/books */
export async function getAllBooks(req, res) {
  try {
    const books = await Book.find().lean();
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/** GET /api/books/:id */
export async function getBookById(req, res) {
  try {
    const book = await Book.findById(req.params.id).lean();
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json(book);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

/** GET /api/books/bestrating → top 3 par moyenne */
export async function getBestRated(req, res) {
  try {
    const books = await Book.find().sort({ averageRating: -1 }).limit(3).lean();
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/** POST /api/books (multipart: {book: string, image: file}) */
export async function createBook(req, res) {
  try {
    if (!req.processedImageFilename) return res.status(400).json({ message: "Image is required" });

    const dto = JSON.parse(req.body.book || "{}");
    const { title, author, year, genre, ratings } = dto;
    console.log("dto", dto)

    const imageUrl = `${req.protocol}://${req.get("host")}/images/${req.processedImageFilename}`;
    const book = await Book.create({
      userId: req.auth.userId,
      title,
      author,
      year,
      genre,
      imageUrl,
      ratings,
      averageRating: ratings[0].grade,
    });

    res.status(201).json({ message: "Book created", id: book._id, ratings: book.ratings  });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

/** PUT /api/books/:id (JSON direct ou multipart {book, image}) */
export async function updateBook(req, res) {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    if (String(book.userId) !== req.auth.userId) return res.status(403).json({ message: "unauthorized request" });

    let payload = req.body;
    if (req.body.book) payload = JSON.parse(req.body.book);

    // On interdit tout changement d’auteur du document
    delete payload.userId;
    delete payload._userId;
    delete payload._id;

    // Si nouvelle image → maj imageUrl + supprimer l'ancienne
    if (req.processedImageFilename) {
      await deleteImageByUrl(book.imageUrl);
      payload.imageUrl = `${req.protocol}://${req.get("host")}/images/${req.processedImageFilename}`;
    }

    await Book.updateOne({ _id: book._id }, { $set: payload });
    res.json({ message: "Book updated" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

/** DELETE /api/books/:id (supprime aussi l'image) */
export async function deleteBook(req, res) {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    if (String(book.userId) !== req.auth.userId) return res.status(403).json({ message: "unauthorized request" });

    await deleteImageByUrl(book.imageUrl);
    await Book.deleteOne({ _id: book._id });
    res.json({ message: "Book deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

/** POST /api/books/:id/rating  ({ userId, rating })  → renvoie le livre */
export async function rateBook(req, res) {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    // On ne fait pas confiance au body.userId : on force le user depuis le token
    const userId = req.auth.userId;
    const grade = Number(req.body.rating);

    if (Number.isNaN(grade) || grade < 0 || grade > 5) {
      return res.status(400).json({ message: "Rating must be between 0 and 5" });
    }

    // Empêche les doubles notes
    const already = book.ratings.some(r => String(r.userId) === String(userId));
    if (already) return res.status(400).json({ message: "User has already rated this book" });

    book.ratings.push({ userId, grade });
    // recalcul moyenne
    const sum = book.ratings.reduce((acc, r) => acc + r.grade, 0);
    book.averageRating = sum / book.ratings.length;

    await book.save();
    res.status(201).json(book); // renvoyer le livre en réponse
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}
