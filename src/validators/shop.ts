import { z } from "zod";

// Zod schema for Shop model
export const ShopSchema = z.object({
  name: z.string({required_error: "shop is required"}).min(1, { message: "Shop name is required" }),
  description: z.string().optional().nullable(),
  location: z.string().min(1, { message: "Location is required" }),
  ownerName: z.string().min(1, { message: "Owner name is required" })
});
