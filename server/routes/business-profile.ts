import express from "express";
import { z } from "zod";
import { businessProfileRepository } from "../repositories/BusinessProfileRepository";
import {
  insertBusinessProfileSchema,
  selectBusinessProfileSchema,
} from "../../shared/business-profile-schema";
import { authenticateUser } from "../middleware/auth-middleware";
import { asyncHandler } from "../utils/async-handler";
import { validateRequest } from "../middleware/validation-middleware";
import { upload } from "../middleware/file-upload-middleware"; // Assuming a multer setup

const businessProfileRouter = express.Router();

// Protect all routes in this file with authentication
businessProfileRouter.use(authenticateUser);

/**
 * GET /api/business-profile/me
 * Fetches the business profile associated with the currently authenticated user.
 */
businessProfileRouter.get(
  "/me",
  asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated." });
    }

    const profile = await businessProfileRepository.getByUserId(parseInt(userId, 10));

    if (!profile) {
      return res
        .status(404)
        .json({ message: "Business profile not found for this user." });
    }

    res.status(200).json(profile);
  })
);

/**
 * POST /api/business-profile
 * Creates a new business profile and associates it with the current user.
 */
businessProfileRouter.post(
  "/",
  validateRequest({ body: insertBusinessProfileSchema }),
  asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated." });
    }

    // Check if user already has a profile
    const existingProfile = await businessProfileRepository.getByUserId(parseInt(userId, 10));
    if (existingProfile) {
      return res
        .status(409)
        .json({ message: "A business profile already exists for this user." });
    }

    const newProfile = await businessProfileRepository.create(req.body);

    // Associate the new profile with the user
    await businessProfileRepository.associateUser(parseInt(userId, 10), newProfile.id);

    res.status(201).json(newProfile);
  })
);

/**
 * PUT /api/business-profile
 * Updates the business profile for the currently authenticated user.
 */
businessProfileRouter.put(
  "/",
  validateRequest({ body: insertBusinessProfileSchema.partial() }),
  asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated." });
    }

    const profile = await businessProfileRepository.getByUserId(parseInt(userId, 10));
    if (!profile) {
      return res
        .status(404)
        .json({ message: "Business profile not found to update." });
    }

    const updatedProfile = await businessProfileRepository.update(
      profile.id,
      req.body
    );

    res.status(200).json(updatedProfile);
  })
);

/**
 * GET /api/business-profile/completion-status
 * Checks the completion status of the user's business profile for onboarding.
 */
businessProfileRouter.get(
  "/completion-status",
  asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated." });
    }

    const profile = await businessProfileRepository.getByUserId(parseInt(userId, 10));
    if (!profile) {
      return res
        .status(404)
        .json({ message: "Business profile not found." });
    }

    const status = await businessProfileRepository.getCompletionStatus(profile.id);
    res.status(200).json(status);
  })
);

/**
 * POST /api/business-profile/logo-upload
 * Handles uploading a new logo for the business profile.
 */
businessProfileRouter.post(
  "/logo-upload",
  upload.single("logo"), // 'logo' is the field name in the form-data
  asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const profile = await businessProfileRepository.getByUserId(parseInt(userId, 10));
    if (!profile) {
      return res
        .status(404)
        .json({ message: "Business profile not found to update." });
    }

    // In a real application, `req.file.path` would be a URL from a cloud storage
    // service like S3, Cloudinary, etc., after the upload middleware processes it.
    const logoUrl = req.file.path;

    const updatedProfile = await businessProfileRepository.update(profile.id, {
      logoUrl,
    });

    res
      .status(200)
      .json({
        message: "Logo uploaded successfully.",
        logoUrl: updatedProfile.logoUrl,
      });
  })
);

/**
 * DELETE /api/business-profile
 * Deletes the business profile for the currently authenticated user.
 * This is a sensitive operation and should be handled with care.
 */
businessProfileRouter.delete(
  "/",
  asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated." });
    }

    const profile = await businessProfileRepository.getByUserId(parseInt(userId, 10));
    if (!profile) {
      return res
        .status(404)
        .json({ message: "Business profile not found to delete." });
    }

    await businessProfileRepository.delete(profile.id);

    res.status(204).send();
  })
);

export { businessProfileRouter };

// Use default export so that `import businessProfileRouter from './routes/business-profile'`
// in server/routes.ts resolves correctly.

export default businessProfileRouter;
