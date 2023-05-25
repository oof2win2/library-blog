import { z } from "zod"
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc"
import {
	adminProtectedProcedure,
	userProtectedProcedure,
} from "@/server/api/auth"
import { UserAuthLevel } from "@/utils/types"
import { TRPCError } from "@trpc/server"
import { clearSessionData, saveSessionData } from "@/server/authHandlers"
import { sendPasswordReset, sendVerificationEmail } from "@/server/mail"
let bcrypt: Promise<typeof import("bcryptjs")>
// @ts-expect-error - we are running in a vercel edge function
if (typeof EdgeRuntime === "string") {
	// we are running in a vercel edge function
	// @ts-expect-error stupid import error
	bcrypt = import("bcryptjs/dist/bcrypt")
} else {
	bcrypt = import("bcryptjs")
}

const userRouter = createTRPCRouter({
	login: publicProcedure
		.input(
			z.object({
				email: z.string().email(),
				password: z.string(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const user = await ctx.prisma.user.findUnique({
				where: {
					email: input.email,
				},
			})
			if (!user)
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Invalid email or password",
				})

			if (!(await bcrypt).compareSync(input.password, user.password)) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Invalid email or password",
				})
			}

			await saveSessionData(ctx.responseCookies, user, null)

			return {
				user,
			}
		}),
	logout: publicProcedure.mutation(async ({ ctx }) => {
		await clearSessionData(ctx.req.cookies, ctx.responseCookies)
	}),

	signup: publicProcedure
		.input(
			z.object({
				email: z.string().email(),
				password: z.string().min(8),
				name: z.string().min(1),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const foundUser = await ctx.prisma.user.findUnique({
				where: {
					email: input.email,
				},
			})
			if (foundUser)
				throw new TRPCError({
					code: "CONFLICT",
					message: "Email already in use",
				})

			const allowedDomains = await ctx.prisma.allowedDomain.findMany()
			const isAllowedDomain = allowedDomains.find((d) => {
				if (input.email.endsWith(d.domain)) {
					return true
				}
			})
			if (!isAllowedDomain)
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "This email domain is not allowed",
				})

			// we hash the email to create the token, as it will be unique (bcrypt smart)
			const verificationToken = (await bcrypt).hashSync(input.email)
			const user = await ctx.prisma.user.create({
				data: {
					email: input.email,
					password: (await bcrypt).hashSync(input.password),
					name: input.name,
					userVerification: {
						create: {
							email: input.email,
							token: verificationToken,
						},
					},
				},
			})

			await sendVerificationEmail(user, verificationToken)
		}),

	verify: publicProcedure
		.input(z.string())
		.mutation(async ({ ctx, input }) => {
			const userVerification =
				await ctx.prisma.userVerification.findUnique({
					where: {
						token: input,
					},
					include: {
						User: true,
					},
				})
			if (!userVerification) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Invalid verification token",
				})
			}

			await ctx.prisma.user.update({
				where: {
					id: userVerification.User.id,
				},
				data: {
					userVerification: {
						delete: true,
					},
				},
			})

			await saveSessionData(
				ctx.responseCookies,
				userVerification.User,
				null
			)

			return userVerification.User
		}),

	requestPasswordReset: publicProcedure
		.input(z.string().email())
		.mutation(async ({ ctx, input }) => {
			const foundUser = await ctx.prisma.user.findUnique({
				where: {
					email: input,
				},
			})

			// if there isnt a user, we send a success message to prevent email enumeration
			if (!foundUser) return

			// we hash the email to create the token, as it will be unique (bcrypt smart)
			const passwordResetToken = (await bcrypt).hashSync(input)
			// first delete any old password resets
			await ctx.prisma.passwordReset.deleteMany({
				where: {
					email: input,
				},
			})
			const user = await ctx.prisma.user.update({
				where: {
					email: input,
				},
				data: {
					passwordReset: {
						create: {
							email: input,
							token: passwordResetToken,
						},
					},
				},
			})

			// now we send an email to the user
			await sendPasswordReset(user, passwordResetToken)

			return
		}),

	resetPassword: publicProcedure
		.input(
			z.object({
				token: z.string(),
				password: z.string().min(8),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const foundPasswordReset =
				await ctx.prisma.passwordReset.findUnique({
					where: {
						token: input.token,
					},
				})

			if (!foundPasswordReset)
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Invalid password reset token",
				})

			const user = await ctx.prisma.user.update({
				where: {
					id: foundPasswordReset.userId,
				},
				data: {
					password: (await bcrypt).hashSync(input.password),
					passwordReset: {
						delete: true,
					},
				},
			})

			await saveSessionData(ctx.responseCookies, user, null)

			return user
		}),

	getAdmins: adminProtectedProcedure.query(async ({ ctx }) => {
		const users = await ctx.prisma.user.findMany({
			where: {
				authLevel: UserAuthLevel.Admin,
			},
		})
		return users
	}),

	promoteAdmin: adminProtectedProcedure
		.input(z.string().email())
		.mutation(async ({ ctx, input }) => {
			try {
				const user = await ctx.prisma.user.update({
					where: {
						email: input,
					},
					data: {
						authLevel: UserAuthLevel.Admin,
					},
				})

				return user
			} catch {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "User not found",
				})
			}
		}),
	demoteAdmin: adminProtectedProcedure
		.input(z.string().email())
		.mutation(async ({ ctx, input }) => {
			try {
				const user = await ctx.prisma.user.update({
					where: {
						email: input,
					},
					data: {
						authLevel: UserAuthLevel.User,
					},
				})
				return user
			} catch {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "User not found",
				})
			}
		}),

	getAllowedDomains: adminProtectedProcedure.query(async ({ ctx }) => {
		const domains = await ctx.prisma.allowedDomain.findMany()
		return domains
	}),
	addAllowedDomain: adminProtectedProcedure
		.input(z.string())
		.mutation(async ({ ctx, input }) => {
			try {
				await ctx.prisma.allowedDomain.create({
					data: {
						domain: input,
					},
				})
			} catch {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Domain already exists",
				})
			}
		}),
	removeAllowedDomain: adminProtectedProcedure
		.input(z.string())
		.mutation(async ({ ctx, input }) => {
			try {
				await ctx.prisma.allowedDomain.delete({
					where: {
						domain: input,
					},
				})
			} catch {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Domain not found",
				})
			}
		}),
})

export default userRouter
