import { z } from "zod"

export const CreateReviewForm = z.object({
	rating: z.number().min(1).max(5),
	reviewText: z.string().min(1).max(1000),
	threeWords: z
		.string()
		.refine(
			(arg) => arg.split(" ").filter((x) => x).length === 3,
			"Must be 3 words"
		),
})
export type CreateReviewFormType = z.infer<typeof CreateReviewForm>
