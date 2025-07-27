import z from "zod"

const PriceSchema = z
  .string()
  .min(1, "Price is required")
  .max(50, "Price must be 50 characters or less")
  .refine(
    (val) => {
      // Remove any currency symbols or units (e.g., "₹100/kg" -> "100")
      const cleaned = val.replace(/[^0-9.]/g, "");
      const num = parseFloat(cleaned);
      return !isNaN(num) && num >= 0;
    },
    { message: "Price must be a valid positive number (e.g., '100', '₹100/kg')" }
  )
  .transform((val) => val.trim()); // Store as provided (e.g., "₹100/kg")

// Base MandiPrice Schema
export const MandiPriceSchema = z.object({
  cropName: z
    .string()
    .min(1, "Crop name is required")
    .max(100, "Crop name must be 100 characters or less")
    .trim()
    .refine((val) => /^[a-zA-Z\s]+$/.test(val), {
      message: "Crop name can only contain letters and spaces",
    }),
  currentPrice: PriceSchema,
  lastPrice: PriceSchema,
});