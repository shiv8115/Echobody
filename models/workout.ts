import mongoose, { Schema, Document } from "mongoose";

export interface IWorkoutPlanner extends Document {
  userId: mongoose.Types.ObjectId;
  aiResponse: string;
  timestamp: Date;
}

const WorkoutPlannerSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  aiResponse: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export const WorkoutPlanner = mongoose.model<IWorkoutPlanner>(
  "WorkoutPlanner",
  WorkoutPlannerSchema
);
