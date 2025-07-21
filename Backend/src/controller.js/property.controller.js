import { Property } from "../models/property.model.js";
import { uploadImage, deleteImage } from "../utils/cloudinary.js";
import fs from "fs/promises";
import jwt from "jsonwebtoken";

const createproperty = async (req, res) => {
  try {
    const {
      title,
      description,
      // address,
      city,
      // district,
      // zipcode,
      location,
      rent,
      propertyType,
      noOfBedroom,
      bhkType,
      bathrooms,
      area,
      deposit,
      amenities,
      allowBroker,
    } = req.body;

    // Log incoming request for debugging
    console.log("createproperty: Received body:", req.body);
    console.log("createproperty: Received files:", req.files);
    console.log("createproperty: req.user:", req.user);

    // Verify authenticated user
    const ownerId = req.user?._id || req.user?.id;
    if (!ownerId) {
      if (req.files && req.files.length > 0) {
        await Promise.all(req.files.map((file) => fs.unlink(file.path)));
      }
      return res
        .status(401)
        .json({ message: "Unauthorized: No user ID found" });
    }

    // Validate required fields
    if (
      !title ||
      // !address ||
      !city ||
      // !district ||
      // !zipcode ||
      !location ||
      !rent ||
      !deposit ||
      !bathrooms ||
      !propertyType ||
      !noOfBedroom
    ) {
      if (req.files && req.files.length > 0) {
        await Promise.all(req.files.map((file) => fs.unlink(file.path)));
      }
      return res.status(400).json({
        message:
          "Please fill all required fields: title, city, location, rent, propertyType, noOfBedroom.",
      });
    }

    // Upload images to Cloudinary
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = await Promise.all(req.files.map((file) => uploadImage(file)));
    }

    // Create new property
    const newProperty = new Property({
      title,
      description,
      // address,
      city,
      // district,
      // zipcode: Number(zipcode),
      location,
      rent: Number(rent),
      propertyType,
      noOfBedroom: Number(noOfBedroom),
      bhkType: bhkType || undefined,
      area: Number(area),
      deposit: Number(deposit),
      amenities: Array.isArray(amenities) ? amenities : [],
      allowBroker: allowBroker === "true" || allowBroker === true,
      imageUrls,
      bathrooms: Number(bathrooms),
      owner: ownerId,
    });

    // Save to MongoDB
    await newProperty.save();
    console.log("createproperty: Property saved:", newProperty._id);

    res.status(201).json({
      message: "Property created successfully!",
      propertyId: newProperty._id,
      property: newProperty,
    });
  } catch (error) {
    console.error("createproperty: Error:", error);
    if (req.files && req.files.length > 0) {
      await Promise.all(req.files.map((file) => fs.unlink(file.path)));
    }
    res.status(500).json({
      message: "Failed to create property",
      error: error.message,
    });
  }
};

const updateProperty = async (req, res) => {
  try {
    const propertyId = req.params.id;
    const updates = req.body;
    const authenticatedUserId = req.user._id;

    let imageUrls = updates.imageUrls || [];
    if (req.files && req.files.length > 0) {
      imageUrls = await Promise.all(req.files.map((file) => uploadImage(file)));
    }

    const propertyToUpdate = await Property.findById(propertyId);
    if (!propertyToUpdate) {
      return res.status(404).json({ message: "Property not found" });
    }

    if (propertyToUpdate.owner.toString() !== authenticatedUserId.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this property" });
    }

    // Remove old images from Cloudinary if new images are provided
    if (imageUrls.length > 0 && propertyToUpdate.imageUrls.length > 0) {
      await Promise.all(
        propertyToUpdate.imageUrls.map((imageUrl) => {
          const publicId = imageUrl.split("/").pop().split(".")[0];
          return deleteImage(publicId);
        })
      );
    }

    const updatedProperty = await Property.findByIdAndUpdate(
      propertyId,
      { $set: { ...updates, imageUrls } },
      { new: true }
    );

    if (!updatedProperty) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.status(200).json({
      property: updatedProperty,
      message: "Property updated successfully",
    });
  } catch (error) {
    console.error("Error in updateProperty:", error);
    if (req.files && req.files.length > 0) {
      await Promise.all(req.files.map((file) => fs.unlink(file.path)));
    }
    res.status(500).json({ message: "Server error, please try again later" });
  }
};

const deleteProperty = async (req, res) => {
  try {
    const propertyId = req.params.id;
    const authenticatedUserId = req.user._id;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    if (property.owner.toString() !== authenticatedUserId.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this property" });
    }

    // Delete images from Cloudinary
    if (property.imageUrls && property.imageUrls.length > 0) {
      await Promise.all(
        property.imageUrls.map((imageUrl) => {
          const publicId = imageUrl.split("/").pop().split(".")[0];
          return deleteImage(publicId);
        })
      );
    }

    await Property.findByIdAndDelete(propertyId);

    res.status(200).json({ message: "Property deleted successfully" });
  } catch (error) {
    console.error("Error in deleteProperty:", error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
};

const getAllProperties = async (req, res) => {
  try {
    const properties = await Property.find().populate("owner", "name email phone");
    const sanitizedProperties = properties.map((property) => ({
      ...property.toObject(),
      imageUrls: Array.isArray(property.imageUrls) ? property.imageUrls : [],
    }));
    res.status(200).json({ properties: sanitizedProperties });
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({ message: "Failed to fetch properties" });
  }
};

const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate(
      "owner",
      "name email phone"
    );
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    const sanitizedProperty = {
      ...property.toObject(),
      imageUrls: Array.isArray(property.imageUrls) ? property.imageUrls : [],
      owner: {
        name: property.owner?.name || 'Unknown',
        email: property.owner?.email || 'Unknown',
        phone: property.owner?.phone || '', // Ensure phone is always included
      },
    };
    res.status(200).json({ property: sanitizedProperty });
  } catch (error) {
    console.error("Error fetching property by ID:", error);
    res.status(500).json({ message: "Failed to fetch property" });
  }
};

const searchProperties = async (req, res) => {
  try {
    const { search, propertyType, priceRange, sortBy } = req.query;
    let query = {};

    // Validate query parameters
    if (search && typeof search !== "string") {
      return res
        .status(400)
        .json({ message: "Search parameter must be a string" });
    }
    if (propertyType && typeof propertyType !== "string") {
      return res
        .status(400)
        .json({ message: "PropertyType parameter must be a string" });
    }
    if (priceRange && typeof priceRange !== "string") {
      return res
        .status(400)
        .json({ message: "PriceRange parameter must be a string" });
    }

    // Search query
    if (search && search.trim()) {
      const escapedSearch = search
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.$or = [
        { city: { $regex: escapedSearch, $options: "i" } }, 
        { propertyType: { $regex: escapedSearch, $options: "i" } },
        { location: { $regex: escapedSearch, $options: "i" } },
      ];
    }
    if (search && search.trim()) {
      const escapedSearch = search
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.$or = [
        { city: { $regex: escapedSearch, $options: "i" } },
        { propertyType: { $regex: escapedSearch, $options: "i" } },
        { location: { $regex: escapedSearch, $options: "i" } },
      ];
    }
    // Property type filter
    if (propertyType && propertyType.trim()) {
      query.propertyType = { $regex: propertyType.trim(), $options: "i" };
    }

    // Price range filter
    if (priceRange && priceRange.trim()) {
      if (priceRange.includes("-")) {
        const [minPrice, maxPrice] = priceRange
          .split("-")
          .map((val) => parseFloat(val));
        if (isNaN(minPrice) || isNaN(maxPrice)) {
          return res
            .status(400)
            .json({ message: "Invalid price range format" });
        }
        query.rent = { $gte: minPrice, $lte: maxPrice };
      } else if (priceRange.endsWith("+")) {
        const minPrice = parseFloat(priceRange.replace("+", ""));
        if (isNaN(minPrice)) {
          return res
            .status(400)
            .json({ message: "Invalid minimum price format" });
        }
        query.rent = { $gte: minPrice };
      } else {
        return res.status(400).json({ message: "Invalid price range format" });
      }
    }

    // Execute query
    let findQuery = Property.find(query)
      .populate({ path: "owner", select: "name email", strictPopulate: false })
      .lean();

    // Apply limit only if no search query
    if (!search || !search.trim()) {
      findQuery = findQuery.limit(4);
    }

    let properties = await findQuery;

    // Apply sorting
    switch (sortBy) {
      case "rent-low":
        properties = properties.sort((a, b) => a.rent - b.rent);
        break;
      case "rent-high":
        properties = properties.sort((a, b) => b.rent - a.rent);
        break;
      case "popularity":
        properties = properties.sort(
          (a, b) => (b.rating || 0) - (a.rating || 0)
        );
        break;
      default:
        break;
    }

    const sanitizedProperties = properties.map((property) => ({
      ...property,
      imageUrls: Array.isArray(property.imageUrls) ? property.imageUrls : [],
      owner: property.owner || { name: "Unknown", email: "Unknown" },
    }));

    res.status(200).json({ properties: sanitizedProperties });
  } catch (error) {
    console.error("Error searching properties:", {
      message: error.message,
      stack: error.stack,
      query: req.query,
      timestamp: new Date().toISOString(),
    });
    res.status(500).json({
      message: "Failed to search properties",
      error: error.message,
      details: {
        query: req.query,
        errorName: error.name,
        errorCode: error.code,
      },
    });
  }
};

export {
  createproperty,
  updateProperty,
  deleteProperty,
  getAllProperties,
  getPropertyById,
  searchProperties,
};
