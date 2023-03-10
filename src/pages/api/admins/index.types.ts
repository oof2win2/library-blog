import { z } from "zod"

export const PUT_Base_Body = z.object({
	email: z.string().email(),
})
export type PUT_Base_Body = z.infer<typeof PUT_Base_Body>
