import mongoose, { Document, Schema } from "mongoose";

// Health subdocument interface
interface IHeartRateReading {
  timestamp: Date;
  heartRate: number;
}

interface IHealth {
  weight?: number;
  start_weight?: number;
  target_weight?: number;
  height?: number;
  activity_level?: string;
  target_exercise?: string;
  bmi?: number;
  steps?: number;
  target_steps?: number;
  caloriesBurned?: number;
  sleepHours?: number;
  heartRateReadings?: IHeartRateReading[];
}

// Device subdocument interface
interface IDevice {
  user_id: string;
  resource?: string;
  reference_id?: string;
  lan?: string;
}

// User document interface
interface IUser extends Document {
  name?: string;
  gender?: string;
  dateOfBirth?: Date;
  email?: string;
  passwordHash?: string;
  authToken?: string;
  createdAt?: Date;
  lastLogin?: Date;
  health?: IHealth;
  device?: IDevice;
}

// Health Schema
const heartRateReadingSchema = new Schema<IHeartRateReading>({
  timestamp: { type: Date, required: true },
  heartRate: { type: Number, required: true },
});

const healthSchema = new Schema<IHealth>({
  weight: { type: Number },
  start_weight: { type: Number },
  target_weight: { type: Number },
  height: { type: Number },
  activity_level: { type: String },
  target_exercise: { type: String },
  bmi: { type: Number },
  steps: { type: Number },
  target_steps: { type: Number },
  caloriesBurned: { type: Number },
  sleepHours: { type: Number },
  heartRateReadings: { type: [heartRateReadingSchema] },
});

// Device Schema
const deviceSchema = new Schema<IDevice>({
  user_id: { type: String, required: true },
  resource: { type: String },
  reference_id: { type: String },
  lan: { type: String },
});

// User Schema
const userSchema = new Schema<IUser>({
  name: { type: String },
  gender: { type: String },
  dateOfBirth: { type: Date },
  email: { type: String },
  passwordHash: { type: String },
  authToken: { type: String },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date },
  health: { type: healthSchema },
  device: { type: deviceSchema },
});

// Export User model
const User = mongoose.model<IUser>("User", userSchema);
export default User;
