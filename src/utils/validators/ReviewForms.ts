import { z } from "zod"

export const ReviewForm = z.object({
	isbn: z.string().length(13),
	reviewText: z.string().min(1).max(1000),
	rating: z.number().min(1).max(5),
	threeWords: z
		.string()
		.refine(
			(arg) => arg.split(" ").filter((x) => x).length === 3,
			"Must be 3 words"
		),
})
export type ReviewFormType = z.infer<typeof ReviewForm>
