import mongoose, { Schema } from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String,
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    role: { 
        type: String,
        enum:['broker','user'],
        default: 'user' 

    },
    age:{
        type: Number,
        required: true
    },
    phone: { 
        type: String,
        required:true 
    },
    location: { 
        type: String 
    },
    photo: { 
        type: String 
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        default: 'Other'
    },
    // Role information
    isAdmin: { type: Boolean, default: false },
  },

  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
