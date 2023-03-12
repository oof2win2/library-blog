import { z } from "zod"
import { User } from "@/utils/validators/dbTypes"

// JWT cookie session data
export const SessionData = z.object({
	jti: z.string(),
	iat: z.number(),
	exp: z.number(),
	aud: z.number(),
	user: User, // this is added by the getSession, the user is found by the `aud` field
})
export type SessionData = z.infer<typeof SessionData>
