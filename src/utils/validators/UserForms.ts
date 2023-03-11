import {
	PUT_AllowedDomains_Body,
	PUT_ManageBooks_Body,
} from "@/pages/api/admins/index.types"
import { z } from "zod"

export const SignupForm = z.object({
	email: z.string().email(),
	password: z.string().min(8),
	name: z.string().min(1),
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

export const EditAllowedDomain = PUT_AllowedDomains_Body
export type EditAllowedDomainType = z.infer<typeof EditAllowedDomain>

export const EditBook = PUT_ManageBooks_Body
export type EditBookType = z.infer<typeof EditBook>
