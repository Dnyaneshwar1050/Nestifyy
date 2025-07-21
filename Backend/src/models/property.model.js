import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    // address: {
    //   type: String,
    //   required: true,
    //   trim: true,
    // },
    // locality: {
    //   type: String,
    //   trim: true,
    // },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    // district: {
    //   type: String,
    //   required: true,
    //   trim: true,
    // },
    // zipcode: {
    //   type: String,
    //   required: true,
    //   trim: true,
    // },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    rent: {
      type: Number,
      required: true,
      min: [1, "Rent must be at least 1"],
    },
    deposit: {
      type: Number,
      default: 0,
      min: [0, "Deposit cannot be negative"],
    },
    area: {
      type: Number,
      min: [1, "Area must be at least 1 square foot"],
    },
    propertyType: {
      type: String,
      enum: ["house", "apartment", "pg", "commercial", "villa", "shared_room"],
      required: true,
    },
    noOfBedroom: {
      type: Number,
      required: true,
      min: [0, "Number of bedrooms cannot be negative"],
    },
    bathrooms: {
      type: Number,
      min: [0, "Number of bathrooms cannot be negative"],
    },
    bhkType: {
      type: String,
      enum: ["1RK", "1BHK", "2BHK", "3BHK", "4BHK+", ""],
      default: "",
    },
    amenities: {
      type: [String],
      default: [],
    },
    allowBroker: {
      type: Boolean,
      default: true,
    },
    imageUrls: {
      type: [String],
      default: [],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      default: "Active"
    }
  },
  { timestamps: true }
);

export const Property = mongoose.model("Property", propertySchema);