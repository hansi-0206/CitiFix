import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    points: {
      type: Number,
      default: 10, // registers start with 10 onboarding points
    },
    badge: {
      type: String,
      default: "Civic Contributor",
    },
    role: {
      type: String,
      default: "Citizen",
      enum: ["Citizen", "Officer", "Municipal Officer", "Admin"],
    },
  },
  {
    timestamps: true,
  }
);

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Pre-save hook: Hash password and auto-calculate badge level
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  if (this.isModified("points") || this.isNew) {
    if (this.points < 50) {
      this.badge = "Civic Contributor";
    } else if (this.points < 150) {
      this.badge = "Community Guardian";
    } else {
      this.badge = "Civic Champion";
    }
  }

  next();
});

const User = mongoose.model("User", userSchema);

export default User;
