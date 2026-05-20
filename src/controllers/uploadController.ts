import path from "path";
import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { env } from "../config/env";

export const uploadAsset = asyncHandler(async (req: Request, res: Response) => {
  const file = (req as Request & {
    file?: {
      filename: string;
      path: string;
      mimetype: string;
      size: number;
    };
  }).file;

  if (!file) {
    res.status(400).json({
      success: false,
      message: "No file uploaded",
    });
    return;
  }

  const folder = path.basename(path.dirname(file.path));
  const url = `${env.apiBaseUrl}/uploads/${folder}/${file.filename}`;

  res.status(201).json({
    success: true,
    message: "File uploaded",
    data: {
      fileName: file.filename,
      url,
      mimeType: file.mimetype,
      size: file.size,
    },
  });
});
