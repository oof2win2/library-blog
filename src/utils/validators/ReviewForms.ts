import { PUT_ISBN_body } from "@/pages/api/reviews/index.types"
import { z } from "zod"

export const ReviewForm = PUT_ISBN_body.extend({
	isbn: z.string().length(13),
})
export type ReviewFormType = z.infer<typeof ReviewForm>
