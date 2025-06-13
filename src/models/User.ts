import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId; // Password required only if not using Google auth
    },
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  role: {
    type: String,
    enum: ["user", "admin", "validator"],
    default: "user",
  },
  avatar: {
    type: String,
    default: "",
  },
  bio: {
    type: String,
    default: "",
  },
  country: {
    type: String,
    default: "",
  },
  timezone: {
    type: String,
    default: "GMT+0",
  },
  languageProficiency: [{
    id: String,
    level: String,
  }],
  secondaryUsernames: [{
    name: String,
    platform: String,
  }],
  badges: [{
    name: String,
    level: String,
    description: String,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Delete the model if it exists to prevent OverwriteModelError
const User = mongoose.models.User || mongoose.model("User", userSchema);

export { User }; 