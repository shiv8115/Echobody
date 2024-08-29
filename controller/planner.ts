import { Request, Response } from "express";
import { WorkoutPlanner } from "../models/workout";
import { MealPlanner } from "../models/meal";
export const createWorkoutPlanner = async (req: Request, res: Response) => {
  try {
    const { userId, aiResponse } = req.body;

    // Validate request body
    if (!userId || !aiResponse) {
      return res
        .status(400)
        .json({ error: "UserId and aiResponse are required" });
    }

    const newWorkoutPlan = new WorkoutPlanner({
      userId,
      aiResponse,
      timestamp: new Date(),
    });

    const savedWorkoutPlan = await newWorkoutPlan.save();
    res.status(201).json(savedWorkoutPlan);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createMealPlanner = async (req: Request, res: Response) => {
  try {
    const { userId, aiResponse } = req.body;

    if (!userId || !aiResponse) {
      return res
        .status(400)
        .json({ error: "UserId and aiResponse are required" });
    }

    const newMealPlan = new MealPlanner({
      userId,
      aiResponse,
      timestamp: new Date(),
    });

    const savedMealPlan = await newMealPlan.save();
    res.status(201).json(savedMealPlan);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

interface RequestParams {
  type: "meal" | "workout";
  userId: string;
  count: number;
}

export const getPreviousPlanners = async (req: Request, res: Response) => {
  try {
    const { userId, count }: RequestParams = req.params as any;
    const { type } = req.query;

    if (
      !userId ||
      !count ||
      (type && !["meal", "workout"].includes(type as string))
    ) {
      return res.status(400).json({ error: "Invalid userId, count, or type" });
    }

    let planners = [];
    let responseType = "";

    if (type === "meal") {
      planners = await MealPlanner.find({ userId })
        .sort({ timestamp: 1 }) // 1 for ascending order
        .limit(Number(count));
      responseType = "Meal Planner";
    } else if (type === "workout") {
      planners = await WorkoutPlanner.find({ userId })
        .sort({ timestamp: 1 }) // 1 for ascending order
        .limit(Number(count));
      responseType = "Workout Planner";
    } else {
      const mealPlanners = await MealPlanner.find({ userId })
        .sort({ timestamp: 1 })
        .limit(Number(count));
      const workoutPlanners = await WorkoutPlanner.find({ userId })
        .sort({ timestamp: 1 })
        .limit(Number(count));

      planners = [...mealPlanners, ...workoutPlanners]
        .sort((a, b) => (a.timestamp as any) - (b.timestamp as any))
        .slice(0, Number(count));

      responseType = "All Planner";
    }

    if (planners.length === 0) {
      return res
        .status(404)
        .json({ message: "No planners found for this user" });
    }

    res.status(200).json({ type: responseType, planners });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
