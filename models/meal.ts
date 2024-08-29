import mongoose, { Schema, Document } from "mongoose";

export interface IMealPlanner extends Document {
  userId: mongoose.Types.ObjectId;
  aiResponse: string;
  timestamp: Date;
}

const MealPlannerSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  aiResponse: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export const MealPlanner = mongoose.model<IMealPlanner>(
  "MealPlanner",
  MealPlannerSchema
);
