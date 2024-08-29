import { Request, Response } from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { logger as EchoLogger } from '../config/logger';
import axios from 'axios';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const API_URL =
  'https://zylalabs.com/api/4210/ai+workout+planner+api/5113/ai+workout+planner';
const API_KEY = process.env.WORKOUT_API_KEY;

const standardPrompt = `
Prompt for chatgpt:

Generate a personalized weekly meal plan based on the following details:

    Weight: [weight]
    Gender: [gender]
    Age: [age]
    Height: [height]
    Activity Level: [activity level] (choose from beginner, intermediate, advanced)
    Goal: [goal] (choose from weight_loss, muscle_gain, strength_training, cardiovascular_endurance, flexibility, general_fitness)

Please provide a meal plan for a week, structured as:

{
  "Day 1": {
    "Breakfast": "[dish name]",
    "Lunch": "[dish name]",
    "Dinner": "[dish name]"
  },
  "Day 2": {
    "Breakfast": "[dish name]",
    "Lunch": "[dish name]",
    "Dinner": "[dish name]"
  },
  "Day 3": {
    "Breakfast": "[dish name]",
    "Lunch": "[dish name]",
    "Dinner": "[dish name]"
  },
  "Day 4": {
    "Breakfast": "[dish name]",
    "Lunch": "[dish name]",
    "Dinner": "[dish name]"
  },
  "Day 5": {
    "Breakfast": "[dish name]",
    "Lunch": "[dish name]",
    "Dinner": "[dish name]"
  },
  "Day 6": {
    "Breakfast": "[dish name]",
    "Lunch": "[dish name]",
    "Dinner": "[dish name]"
  },
  "Day 7": {
    "Breakfast": "[dish name]",
    "Lunch": "[dish name]",
    "Dinner": "[dish name]"
  }
}

Each "[dish name]" should correspond to a specific meal recommendation based on the nutritional needs and preferences determined by the user's profile.
`;

const validActivityLevels = ['beginner', 'intermediate', 'advanced'];

const validGoals = [
  'weight_loss',
  'muscle_gain',
  'strength_training',
  'cardiovascular_endurance',
  'flexibility',
  'general_fitness',
];

const validTargets = [
  'abs',
  'quads',
  'lats',
  'calves',
  'pectorals',
  'glutes',
  'hamstrings',
  'adductors',
  'triceps',
  'cardiovascular system',
  'spine',
  'upper back',
  'biceps',
  'delts',
  'forearms',
  'traps',
  'serratus anterior',
  'abductors',
  'levator scapulae',
];

export const chatGptPrompt = async (req: Request, res: Response) => {
  EchoLogger.info(`New request received - endpoint: ${req.url}`);

  try {
    const { weight, gender, age, height, activity_level, goal } = req.body;
    if (!weight) {
      EchoLogger.error(
        `Missing required parameter: weight - endpoint: ${req.url}`
      );
      return res.status(400).json({
        success: 0,
        message: 'Missing required parameter: weight',
      });
    }

    if (!gender) {
      EchoLogger.error(
        `Missing required parameter: gender - endpoint: ${req.url}`
      );
      return res.status(400).json({
        success: 0,
        message: 'Missing required parameter: gender',
      });
    }

    if (!age) {
      EchoLogger.error(
        `Missing required parameter: age - endpoint: ${req.url}`
      );
      return res.status(400).json({
        success: 0,
        message: 'Missing required parameter: age',
      });
    }

    if (!height) {
      EchoLogger.error(
        `Missing required parameter: height - endpoint: ${req.url}`
      );
      return res.status(400).json({
        success: 0,
        message: 'Missing required parameter: height',
      });
    }

    if (!activity_level) {
      EchoLogger.error(
        `Missing required parameter: activity_level - endpoint: ${req.url}`
      );
      return res.status(400).json({
        success: 0,
        message: 'Missing required parameter: activity_level',
      });
    }

    if (!validActivityLevels.includes(activity_level)) {
      EchoLogger.error(
        `Invalid parameter: activity_level must be one of ${validActivityLevels.join(
          ', '
        )} - endpoint: ${req.url}`
      );
      return res.status(400).json({
        success: 0,
        message: `Invalid parameter: activity_level must be one of ${validActivityLevels.join(
          ', '
        )}`,
      });
    }

    if (!goal) {
      EchoLogger.error(
        `Missing required parameter: goal - endpoint: ${req.url}`
      );
      return res.status(400).json({
        success: 0,
        message: 'Missing required parameter: goal',
      });
    }

    if (!validGoals.includes(goal)) {
      EchoLogger.error(
        `Invalid parameter: goal must be one of ${validGoals.join(
          ', '
        )} - endpoint: ${req.url}`
      );
      return res.status(400).json({
        success: 0,
        message: `Invalid parameter: goal must be one of ${validGoals.join(
          ', '
        )}`,
      });
    }

    const message = standardPrompt
      .replace('[weight]', weight)
      .replace('[gender]', gender)
      .replace('[age]', age.toString())
      .replace('[height]', height)
      .replace('[activity level]', activity_level)
      .replace('[goal]', goal);

    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: message }],
    });

    const response = chatCompletion.choices[0]?.message?.content;

    if (response) {
      EchoLogger.info(
        `Chat prompt processed successfully - endpoint: ${req.url}`
      );

      const formattedResponse = JSON.parse(response);

      return res.status(200).json({
        status: true,
        message: 'Workout meals generated successfully.',
        routine: formattedResponse,
      });
    } else {
      EchoLogger.error(
        `Failed to get a valid response from OpenAI - endpoint: ${req.url}`
      );
      return res.status(500).json({
        success: 0,
        message: 'Failed to get a valid response from OpenAI',
      });
    }
  } catch (error: any) {
    EchoLogger.error(`Error occurred - endpoint: ${req.url} error: ${error}`);
    return res.status(500).json({
      success: 0,
      message: 'Internal server error',
    });
  }
};

export const getWorkoutPlan = async (req: Request, res: Response) => {
  EchoLogger.info(`New request received - endpoint: ${req.url}`);
  try {
    const { target, gender, weight, goal } = req.query;

    console.log('request query--', req.query);

    // Input validation
    if (!target) {
      EchoLogger.error(
        `Missing required parameter: target - endpoint: ${req.url}`
      );
      return res.status(400).json({
        success: false,
        message: 'Missing required parameter: target',
      });
    }
    if (!validTargets.includes(target as string)) {
      EchoLogger.error(
        `Invalid target: must be one of ${validTargets.join(
          ', '
        )} - endpoint: ${req.url}`
      );
      return res.status(400).json({
        success: false,
        message: `Invalid target: must be one of ${validTargets.join(', ')}`,
      });
    }

    if (!gender) {
      EchoLogger.error(
        `Missing required parameter: gender - endpoint: ${req.url}`
      );
      return res.status(400).json({
        success: false,
        message: 'Missing required parameter: gender',
      });
    }

    if (!weight) {
      EchoLogger.error(
        `Missing required parameter: weight - endpoint: ${req.url}`
      );
      return res.status(400).json({
        success: false,
        message: 'Missing required parameter: weight',
      });
    }

    if (!goal) {
      EchoLogger.error(
        `Missing required parameter: goal - endpoint: ${req.url}`
      );
      return res.status(400).json({
        success: false,
        message: 'Missing required parameter: goal',
      });
    }
    if (!validGoals.includes(goal as string)) {
      EchoLogger.error(
        `Invalid goal: must be one of ${validGoals.join(', ')} - endpoint: ${
          req.url
        }`
      );
      return res.status(400).json({
        success: false,
        message: `Invalid goal: must be one of ${validGoals.join(', ')}`,
      });
    }

    // Construct prompt for ChatGPT
    //     const prompt = `
    // Generate a workout routine for a ${weight} kg ${gender} focusing on ${target} for ${goal}. Include exercises and sets/reps for each day of the week.
    // Example response format:
    //  \`Based on your goal of ${goal} and the specific ${target}-focused exercises, here is a personalized workout routine for you: **Workout Routine: ${target} ${goal}** **Day 1:**\\n1. Exercise 1 - 4 sets x 12 reps\\n2. Exercise 2 - 3 sets x 15 reps\\n3. Exercise 3 - 4 sets x 10 reps **Day 2:**\\n1. Exercise 4 - 4 sets x 12 reps\\n2. Exercise 5 - 3 sets x 15 reps\\n3. Exercise 6 - 4 sets x 10 reps **Day 3:**\\n1. Exercise 7 - 4 sets x 12 reps\\n2. Exercise 8 - 3 sets x 15 reps\\n3. Exercise 9 - 4 sets x 10 reps **Day 4:**\\nRest day or optional light cardio/stretching. **Notes:**\\n- Perform each exercise with proper form and controlled movements to maximize muscle engagement.\\n- Focus on progressive overload by increasing weight gradually as you get stronger.\\n- Ensure adequate protein intake and overall nutrition to support muscle growth.\\n- Hydrate well and get sufficient rest for muscle recovery and growth. This routine targets your ${target} from various angles to stimulate muscle growth effectively. Adjust weights and reps based on your fitness level and ensure warm-up before starting each workout. Make sure to consult with a fitness professional before beginning any new exercise routine.\`
    // }
    // `;

    const prompt = `
    Generate a workout routine based on the following details:
    
        Weight: ${weight} kg
        Gender: ${gender}
        Target: ${target}
        Goal: ${goal}
    
    Please provide a workout routine for a week, structured as:
    
    {
      "Day 1": {
        "Exercise 1": "4 sets x 12 reps",
        "Exercise 2": "3 sets x 15 reps",
        "Exercise 3": "4 sets x 10 reps"
      },
      "Day 2": {
        "Exercise 4": "4 sets x 12 reps",
        "Exercise 5": "3 sets x 15 reps",
        "Exercise 6": "4 sets x 10 reps"
      },
      "Day 3": {
        "Exercise 7": "4 sets x 12 reps",
        "Exercise 8": "3 sets x 15 reps",
        "Exercise 9": "4 sets x 10 reps"
      },
      "Day 4": {
        "Rest day or optional light cardio/stretching":""
      },
      "Day 5": {
        "Exercise 10": "4 sets x 12 reps",
        "Exercise 11": "3 sets x 15 reps",
        "Exercise 12": "4 sets x 10 reps"
      },
      "Day 6": {
        "Exercise 13": "4 sets x 12 reps",
        "Exercise 14": "3 sets x 15 reps",
        "Exercise 15": "4 sets x 10 reps"
      },
      "Day 7": {
        "Exercise 16": "4 sets x 12 reps",
        "Exercise 17": "3 sets x 15 reps",
        "Exercise 18": "4 sets x 10 reps"
      }
    }
    `;

    // Make API request to OpenAI
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });

    const response = chatCompletion.choices[0]?.message?.content;

    if (response) {
      EchoLogger.info(
        `Chat prompt processed successfully - endpoint: ${req.url}`
      );

      const formattedJson = JSON.parse(response);
      console.log(typeof formattedJson);

      return res.status(200).json({
        status: true,
        message: 'Workout routine created successfully.',
        routine: formattedJson,
      });
    } else {
      EchoLogger.error(
        `Failed to get a valid response from OpenAI - endpoint: ${req.url}`
      );
      return res.status(500).json({
        success: 0,
        message: 'Failed to get a valid response from OpenAI',
      });
    }
  } catch (error: any) {
    EchoLogger.error(
      `Error fetching workout plan - endpoint: ${req.url} error: ${error}`
    );
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const standardPromptV2 = `
Prompt for chatgpt:

Generate a personalized weekly meal plan based on the following details:

    Name: [name]
    Gender: [gender]
    Age: [age]
    Height: [height]
    Current Weight: [current_weight]
    Target Weight: [target_weight]
    Activity Level: [activity_level] (choose from beginner, intermediate, advanced)
    Heartbeat: [heart_beat]
    Sleep: [sleep]
    Calories Burnt: [calories_burnt]
    Steps: [steps]

Please provide a meal plan for a week, structured as:

{
  "Day 1": {
    "Breakfast": "[dish name]",
    "Lunch": "[dish name]",
    "Dinner": "[dish name]"
  },
  "Day 2": {
    "Breakfast": "[dish name]",
    "Lunch": "[dish name]",
    "Dinner": "[dish name]"
  },
  "Day 3": {
    "Breakfast": "[dish name]",
    "Lunch": "[dish name]",
    "Dinner": "[dish name]"
  },
  "Day 4": {
    "Breakfast": "[dish name]",
    "Lunch": "[dish name]",
    "Dinner": "[dish name]"
  },
  "Day 5": {
    "Breakfast": "[dish name]",
    "Lunch": "[dish name]",
    "Dinner": "[dish name]"
  },
  "Day 6": {
    "Breakfast": "[dish name]",
    "Lunch": "[dish name]",
    "Dinner": "[dish name]"
  },
  "Day 7": {
    "Breakfast": "[dish name]",
    "Lunch": "[dish name]",
    "Dinner": "[dish name]"
  }
}

Each "[dish name]" should correspond to a specific meal recommendation based on the nutritional needs and preferences determined by the user's profile.
`;

export const mealPlannerV2 = async (req: Request, res: Response) => {
  EchoLogger.info(`New request received - endpoint: ${req.url}`);

  try {
    const {
      name,
      gender,
      age,
      height,
      target_weight,
      current_weight,
      activity_level,
      heart_beat,
      sleep,
      calories_burnt,
      steps,
    } = req.body;

    // Required fields validation
    const requiredFields = [
      { key: 'name', value: name },
      { key: 'gender', value: gender },
      { key: 'age', value: age },
      { key: 'height', value: height },
      { key: 'target_weight', value: target_weight },
      { key: 'current_weight', value: current_weight },
      { key: 'activity_level', value: activity_level },
    ];

    for (const field of requiredFields) {
      if (!field.value) {
        EchoLogger.error(
          `Missing required parameter: ${field.key} - endpoint: ${req.url}`
        );
        return res.status(400).json({
          success: 0,
          message: `Missing required parameter: ${field.key}`,
        });
      }
    }

    // Validate activity_level
    if (!validActivityLevels.includes(activity_level)) {
      EchoLogger.error(
        `Invalid parameter: activity_level must be one of ${validActivityLevels.join(
          ', '
        )} - endpoint: ${req.url}`
      );
      return res.status(400).json({
        success: 0,
        message: `Invalid parameter: activity_level must be one of ${validActivityLevels.join(
          ', '
        )}`,
      });
    }

    // Build the prompt
    let message = standardPromptV2
      .replace('[name]', name)
      .replace('[gender]', gender)
      .replace('[age]', age.toString())
      .replace('[height]', height)
      .replace('[target_weight]', target_weight)
      .replace('[current_weight]', current_weight)
      .replace('[activity_level]', activity_level);

    // Replace optional parameters if they exist
    message = heart_beat ? message.replace('[heart_beat]', heart_beat) : message.replace('[heart_beat]', '');
    message = sleep ? message.replace('[sleep]', sleep) : message.replace('[sleep]', '');
    message = calories_burnt ? message.replace('[calories_burnt]', calories_burnt) : message.replace('[calories_burnt]', '');
    message = steps ? message.replace('[steps]', steps.toString()) : message.replace('[steps]', '');

    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: message }],
    });

    const response = chatCompletion.choices[0]?.message?.content;

    if (response) {
      EchoLogger.info(
        `Chat prompt processed successfully - endpoint: ${req.url}`
      );

      let formattedResponse;
      try {
        // Try to parse response as JSON
        formattedResponse = JSON.parse(response);
      } catch (jsonError) {
        // If it's not valid JSON, treat it as plain text
        formattedResponse = response;
      }

      return res.status(200).json({
        status: true,
        message: 'Meal plan generated successfully.',
        requestData: req.body,
        routine: formattedResponse,
      });
    } else {
      EchoLogger.error(
        `Failed to get a valid response from OpenAI - endpoint: ${req.url}`
      );
      return res.status(500).json({
        success: 0,
        message: 'Failed to get a valid response from OpenAI',
      });
    }
  } catch (error) {
    EchoLogger.error(`Error occurred - endpoint: ${req.url} error: ${error}`);
    return res.status(500).json({
      success: 0,
      message: 'Internal server error',
    });
  }
};

export const getWorkoutPlanV2 = async (req: Request, res: Response) => {
  EchoLogger.info(`New request received - endpoint: ${req.url}`);

  try {
    const {
      name,
      gender,
      age,
      height,
      target_weight,
      current_weight,
      activity_level,
      heart_beat,
      sleep,
      calories_burnt,
      steps,
    } = req.body;

    // Input validation (example: check required fields)
    if (
      !name ||
      !gender ||
      !age ||
      !height ||
      !target_weight ||
      !current_weight ||
      !activity_level
    ) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required.',
      });
    }

    // Construct prompt for ChatGPT
    const prompt = `
    Generate a workout routine for a ${current_weight} kg ${gender}, aged ${age}, with a height of ${height} cm and a target weight of ${target_weight}. 
    ${heart_beat ? `Heart beat is ${heart_beat}.` : ''}
    ${activity_level ? `Activity level is ${activity_level}.` : ''}
    ${sleep ? `Sleep duration is ${sleep}.` : ''}
    ${calories_burnt ? `Calories burnt is ${calories_burnt}.` : ''}
    ${steps ? `${steps} steps per day.` : ''}
    Include exercises and sets/reps for each day of the week. 

Please provide a workout routine for a week, structured as:

Example excercise field: "Excercise 1": "Squats - 4 sets x 10 reps"
    
    {
      "Day 1": {
        "Exercise 1": "(Exercise Name)-4 sets x 12 reps",
        "Exercise 2": "(Exercise Name)-3 sets x 15 reps",
        "Exercise 3": "(Exercise Name)-4 sets x 10 reps"
      },
      "Day 2": {
        "Exercise 4": "(Exercise Name)-4 sets x 12 reps",
        "Exercise 5": "(Exercise Name)-3 sets x 15 reps",
        "Exercise 6": "(Exercise Name)-4 sets x 10 reps"
      },
      "Day 3": {
        "Exercise 7": "(Exercise Name)-4 sets x 12 reps",
        "Exercise 8": "(Exercise Name)-3 sets x 15 reps",
        "Exercise 9": "(Exercise Name)-4 sets x 10 reps"
      },
      "Day 4": {
        "Rest day or optional light cardio/stretching":""
      },
      "Day 5": {
        "Exercise 10": "(Exercise Name)-4 sets x 12 reps",
        "Exercise 11": "(Exercise Name)-3 sets x 15 reps",
        "Exercise 12": "(Exercise Name)-4 sets x 10 reps"
      },
      "Day 6": {
        "Exercise 13": "(Exercise Name)-4 sets x 12 reps",
        "Exercise 14": "(Exercise Name)-3 sets x 15 reps",
        "Exercise 15": "(Exercise Name)-4 sets x 10 reps"
      },
      "Day 7": {
        "Exercise 16": "(Exercise Name)-4 sets x 12 reps",
        "Exercise 17": "(Exercise Name)-3 sets x 15 reps",
        "Exercise 18": "(Exercise Name)-4 sets x 10 reps"
      }
    }
`;

    // Make API request to OpenAI
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });

    const response = chatCompletion.choices[0]?.message?.content;

    if (response) {
      EchoLogger.info(
        `Chat prompt processed successfully - endpoint: ${req.url}`
      );
      const formattedJson = JSON.parse(response);

      // No longer trying to parse the response as JSON, instead returning as a plain text response.
      return res.status(200).json({
        status: true,
        message: 'Workout routine created successfully.',
        requestData: req.body,
        routine: formattedJson, // Return the workout routine as a plain text response
      });
    } else {
      EchoLogger.error(
        `Failed to get a valid response from OpenAI - endpoint: ${req.url}`
      );
      return res.status(500).json({
        success: 0,
        message: 'Failed to get a valid response from OpenAI',
      });
    }
  } catch (error: any) {
    EchoLogger.error(
      `Error fetching workout plan - endpoint: ${req.url} error: ${error}`
    );
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
