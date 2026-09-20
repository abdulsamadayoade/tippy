import { z } from "zod";

const pageRequestSchema = z.object({
  filter: z.enum(["all", "notes", "anonymous"]),
  cursor: z.object({ createdAt: z.iso.datetime(), id: z.uuid() }).nullable(),
});

export { pageRequestSchema };
