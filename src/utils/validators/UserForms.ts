import { z } from "zod"

export const SignupForm = z.object({
	email: z.string().email(),
	password: z.string().min(8),
})
export type SignupFormType = z.infer<typeof SignupForm>

export const LoginForm = z.object({
	email: z.string().email(),
	password: z.string().min(8),
})
export type LoginFormType = z.infer<typeof LoginForm>
