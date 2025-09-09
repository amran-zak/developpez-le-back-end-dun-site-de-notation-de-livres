import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,           // index unique
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: {
      type: String,           // mot de passe haché (bcrypt côté service auth)
      required: true,
      minlength: 8,
    },
  },
  { timestamps: true }
);

// Meilleurs messages d’erreur pour l’unicité (exigence des specs)
userSchema.plugin(uniqueValidator);

export default mongoose.model("User", userSchema);
