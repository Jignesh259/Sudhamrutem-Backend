import multer from "multer";
import path from "path";
import fs from "fs";
import { env } from "../config/env";

const ensureDir = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: (
    _req: unknown,
    file: { fieldname: string },
    cb: (error: Error | null, destination: string) => void
  ) => {
    const folder =
      file.fieldname === "blogImage"
        ? "blogs"
        : file.fieldname === "certificationImage"
        ? "certifications"
        : "products";

    const dir = path.join(process.cwd(), env.uploadsDir, folder);
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (
    _req: unknown,
    file: { originalname: string },
    cb: (error: Error | null, filename: string) => void
  ) => {
    const ext = path.extname(file.originalname);
    const base = path
      .basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");
    cb(null, `${Date.now()}-${base}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});
