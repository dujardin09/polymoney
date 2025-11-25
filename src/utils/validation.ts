import { z } from "zod";

export const marketQuerySchema = z.object({
  minPrice: z.coerce.number().min(0).max(1).default(0.95),
  maxPrice: z.coerce.number().min(0).max(1).default(0.99),
  maxMinutes: z.coerce.number().int().positive().default(60),
});

export type MarketQuery = z.infer<typeof marketQuerySchema>;

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export function validateMarketQuery(params: URLSearchParams): MarketQuery {
  try {
    return marketQuerySchema.parse({
      minPrice: params.get("minPrice"),
      maxPrice: params.get("maxPrice"),
      maxMinutes: params.get("maxMinutes"),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(
        error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", "),
      );
    }
    throw error;
  }
}
