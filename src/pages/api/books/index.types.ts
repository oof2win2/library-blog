import { z } from "zod"

export const GET_Base_query = z.object({
	page: z.number().optional().default(0),
	amountPerPage: z
		.string()
		.default("25")
		.transform((v, ctx) => {
			const num = parseInt(v)
			if (Number.isNaN(num)) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "amountPerPage must be a number",
				})
			}
			if (num < 1 || num > 100) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "amountPerPage must be between 1 and 100",
				})
			}
			return num
		}),
})
export type GET_Base_query = z.infer<typeof GET_Base_query>
