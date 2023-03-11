import { z } from "zod"

export const PUT_Base_Body = z.object({
	email: z.string().email(),
})
export type PUT_Base_Body = z.infer<typeof PUT_Base_Body>

export const PUT_AllowedDomains_Body = z.object({
	domain: z.string(),
})
export type PUT_AllowedDomains_Body = z.infer<typeof PUT_AllowedDomains_Body>
