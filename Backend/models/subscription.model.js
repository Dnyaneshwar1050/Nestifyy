import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
    {
    name: { type: String, required: true, unique: true },
    priceMonthly: { type: Number, required: true },
    features: { type: [String], default: [] },
    description: { type: String },
    },
    {
        timestamps:true
    }
) 

export const subscription = new mongoose.model("subscription", subscriptionSchema)