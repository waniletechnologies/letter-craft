import Dispute from "../models/dispute.model.js";

// Create a new dispute
export const createDispute = async (data) => {
  const dispute = new Dispute(data);
  return await dispute.save();
};

// Get all disputes
export const getAllDisputes = async () => {
  return await Dispute.find().sort({ createdAt: -1 });
};

// Get dispute by ID
export const getDisputeById = async (id) => {
  return await Dispute.findById(id);
};

// Update dispute
export const updateDispute = async (id, data) => {
  return await Dispute.findByIdAndUpdate(id, data, { new: true });
};

// Delete dispute
export const deleteDispute = async (id) => {
  return await Dispute.findByIdAndDelete(id);
};
