import { z } from "zod";

export const MediaValidationSchema = z.object({
  body: z.object({
    fieldname: z.string(),
    originalname: z.string(),
    encoding: z.string(),
    mimetype: z.string(),
    destination: z.string(),
    filename: z.string(),
    path: z.string().url("File is not uploaded"),
    size: z.number(),
  }),
});
