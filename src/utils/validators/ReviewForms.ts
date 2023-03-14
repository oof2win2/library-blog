import { CreateReviewForm } from "@/server/api/validators/reviews"
import { z } from "zod"

export const ReviewForm = CreateReviewForm.extend({
	isbn: z.string().length(13),
})
export type ReviewFormType = z.infer<typeof ReviewForm>
