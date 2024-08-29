import express from "express";
const router = express.Router();
import {
  chatGptPrompt,
  getWorkoutPlan,
  mealPlannerV2,
  getWorkoutPlanV2,
} from "../controller/chatgpt";
import {
  createUser,
  updateUser,
  loginUser,
} from "../controller/userController";
import {
  createMealPlanner,
  createWorkoutPlanner,
  getPreviousPlanners,
} from "../controller/planner";

router.post("/generate-plan", chatGptPrompt);
router.get("/generate-workout-plan", getWorkoutPlan);
router.post("/generate-meal-plan-v2", mealPlannerV2);
router.post("/generate-workout-plan-v2", getWorkoutPlanV2);
router.post("/user", createUser);
router.patch("/users/:userId", updateUser);
router.post("/login", loginUser);
router.post("/store-workout-planner", createWorkoutPlanner);
router.post("/store-meal-planner", createMealPlanner);
router.get("/planners/:userId/:count", getPreviousPlanners);

module.exports = router;
