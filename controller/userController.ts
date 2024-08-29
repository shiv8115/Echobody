import { Request, Response } from "express";
import User from "../models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET =
  "9fd3a6a657dc783e30b8f346194b55d564de1f7420d6a4f17e4e5ea479d9d74d";

export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, gender, dateOfBirth, email, password, health, device } =
      req.body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      res
        .status(400)
        .json({ error: "Name is required and must be a non-empty string." });
      return;
    }

    if (email && (typeof email !== "string" || !email.includes("@"))) {
      res.status(400).json({ error: "Invalid email format." });
      return;
    }

    if (dateOfBirth && isNaN(Date.parse(dateOfBirth))) {
      res.status(400).json({ error: "Invalid date of birth." });
      return;
    }

    if (health) {
      const { weight, height } = health;
      if (weight && (typeof weight !== "number" || weight <= 0)) {
        res.status(400).json({ error: "Weight must be a positive number." });
        return;
      }
      if (height && (typeof height !== "number" || height <= 0)) {
        res.status(400).json({ error: "Height must be a positive number." });
        return;
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user instance
    const newUser = new User({
      name: name.trim(),
      gender,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      email: email?.toLowerCase().trim(),
      passwordHash: hashedPassword,
      createdAt: new Date(),
      lastLogin: new Date(),
      health,
      device,
    });

    const token = jwt.sign(
      { email: newUser.email, name: newUser.name },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    newUser.authToken = token;

    const savedUser = await newUser.save();

    res.status(201).json({
      message: "User created successfully",
      user: savedUser,
    });
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    const updateData: any = req.body;

    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.passwordHash = await bcrypt.hash(updateData.password, salt);
      delete updateData.password;
    }

    const updateUserFields = (fields: any, path: string[] = []): any => {
      return Object.keys(fields).reduce((acc: any, key) => {
        const currentPath = [...path, key];
        if (
          typeof fields[key] === "object" &&
          fields[key] !== null &&
          !Array.isArray(fields[key])
        ) {
          const nestedFields = updateUserFields(fields[key], currentPath);
          Object.assign(acc, nestedFields);
        } else {
          const fieldPath = currentPath.join(".");
          acc[fieldPath] = fields[key];
        }
        return acc;
      }, {});
    };

    const nestedUpdateData = updateUserFields(updateData);

    const updatedUser = await User.findByIdAndUpdate(userId, nestedUpdateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      res.status(400).json({ error: "Invalid email format." });
      return;
    }

    if (!password || typeof password !== "string") {
      res
        .status(400)
        .json({ error: "Password is required and must be a string." });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    if (!user.passwordHash) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    const token = jwt.sign({ email: user.email, name: user.name }, JWT_SECRET, {
      expiresIn: "24h",
    });

    res.status(200).json({
      message: "Login successful",
      authToken: token,
    });
  } catch (err) {
    console.error("Error logging in:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
