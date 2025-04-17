const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Le nom est requis"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "L'email est requis"],
      unique: true,
      lowercase: true,
      match: [/.+\@.+\..+/, "Veuillez entrer un email valide"],
    },
    numero: {
      type: String,
      default: ''
    },
    avatar: {
      type: String, // URL de l'image stockée sur Cloudinary
      default: '', // ou tu laisses vide
    },
    avatarPublicId: {
      type: String,
      default: "",
    },
    
    password: {
      type: String,
      required: [true, "Le mot de passe est requis"],
      minlength: 6,
      select: false, // Ne pas renvoyer le mot de passe par défaut
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
      select: false,
    },
    verificationCodeValidation: {
      type: Date, // Changer de Number à String pour éviter les erreurs
      select: false,
    },
    forgotPasswordCode: {
      type: String,
      select: false,
    },
    forgotPasswordCodeExpires: {
      type: Date, // Expiration du code OTP pour réinitialiser le mot de passe
      select: false,
    },
    otpConfirmed: {
      type: Boolean,
      default: false
    },
 
  },
  { timestamps: true }
);

// Hachage du mot de passe avant enregistrement
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Méthode pour comparer les mots de passe
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
