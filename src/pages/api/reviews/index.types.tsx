import { z } from "zod";

export const GET_Query = z.object({
  page: z.number().optional().default(0),
  amountPerPage: z.string().transform((v, ctx) => {
    const num = parseInt(v);
    if (Number.isNaN(num)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "amountPerPage must be a number",
      });
    }
    return num;
  }),
});
export type GET_Query = z.infer<typeof GET_Query>;
