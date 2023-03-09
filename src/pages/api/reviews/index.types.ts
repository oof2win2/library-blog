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

export const GET_ISBN_params = z.object({
	isbn: z
		.string()
		.length(13)
		.transform((v, ctx) => {
			const num = parseInt(v)
			if (Number.isNaN(num)) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "ISBN must be a number",
				})
			}
			return num
		}),
})
export type GET_ISBN_params = z.infer<typeof GET_ISBN_params>

export const PUT_ISBN_query = z.object({
	isbn: z.string(),
})
export type PUT_ISBN_query = z.infer<typeof PUT_ISBN_query>

export const PUT_ISBN_body = z.object({
	rating: z.number().min(1).max(5),
	reviewText: z.string().min(1).max(1000),
	threeWords: z
		.string()
		.refine(
			(arg) => arg.split(" ").filter((x) => x).length === 3,
			"Must be 3 words"
		),
})
export type PUT_ISBN_body = z.infer<typeof PUT_ISBN_body>
