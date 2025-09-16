import mongoose from "mongoose";

const { Schema, Types } = mongoose;

// Sous-document pour une note
const ratingSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,     // identifiant MongoDB de l'utilisateur
      ref: "User",
      required: true,
    },
    grade: {
      type: Number,
      required: true,
      min: 0,
      max: 5,                   // note entre 0 et 5
    },
  },
  { _id: false, timestamps: true }
);

const bookSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,     // créateur du livre
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    author: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: Number,
      required: true,
      min: 0,
      max: 3000,
    },
    genre: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    ratings: {
      type: [ratingSchema],
      default: [],
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      set: v => Math.round(v * 10) / 10, // arrondi 1 décimale (confort visuel)
    },
  },
  { timestamps: true }
);

/**
 * Recalcule et met à jour la moyenne à partir du tableau ratings.
 * Renvoie la moyenne.
 */
bookSchema.methods.recomputeAverage = function () {
  if (!this.ratings?.length) {
    this.averageRating = 0;
    return this.averageRating;
  }
  const sum = this.ratings.reduce((acc, r) => acc + r.grade, 0);
  this.averageRating = sum / this.ratings.length;
  return this.averageRating;
};

/**
 * Ajoute une note pour un user.
 * - Empêche qu’un user note deux fois.
 * - Met à jour averageRating.
 * - Ne permet pas de modifier une note existante (exigence des specs).
 */
bookSchema.methods.addRating = function (userId, grade) {
  const already = this.ratings.some(
    r => String(r.userId) === String(userId)
  );
  if (already) {
    const err = new Error("User has already rated this book");
    err.status = 400; // renvoyer l’erreur telle quelle côté route
    throw err;
  }
  this.ratings.push({ userId, grade });
  this.recomputeAverage();
  return this;
};

// Index utile pour la liste des “meilleures notes”
bookSchema.index({ averageRating: -1, createdAt: -1 });

export default mongoose.model("Book", bookSchema);
