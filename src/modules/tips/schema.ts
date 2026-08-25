import { z } from "zod";

const pageRequestSchema = z.object({
  filter: z.enum(["all", "notes", "anonymous"]),
  cursor: z.object({ createdAt: z.iso.datetime(), id: z.uuid() }).nullable(),
  loadedCount: z.number().int().min(0).max(100_000),
});

export { pageRequestSchema };
