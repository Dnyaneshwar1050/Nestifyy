// src/controller.js/subscription.controller.js
import { User } from "../models/user.model.js"; // Adjust based on your User model

const getSubscriptionStatus = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const user = await User.findById(userId).select('subscriptionStatus');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ status: user.subscriptionStatus || 'inactive' });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch subscription status", error: error.message });
  }
};

const purchaseSubscription = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { plan } = req.body;
    if (!plan) {
      return res.status(400).json({ message: "Plan is required" });
    }
    const user = await User.findByIdAndUpdate(
      userId,
      { subscriptionStatus: 'active' },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: `Successfully subscribed to ${plan} plan` });
  } catch (error) {
    res.status(500).json({ message: "Failed to purchase subscription", error: error.message });
  }
};

export { getSubscriptionStatus, purchaseSubscription };