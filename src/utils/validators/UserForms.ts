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

export const EditAdminUser = z.object({
	email: z.string().email(),
})
export type EditAdminUserType = z.infer<typeof EditAdminUser>

export const EditAllowedDomain = z.object({
	domain: z.string(),
})
export type EditAllowedDomainType = z.infer<typeof EditAllowedDomain>
