import { z } from "zod"
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc"
import {
	adminProtectedProcedure,
	userProtectedProcedure,
} from "@/server/api/auth"
import { UserAuthLevel } from "@/utils/types"
import bcrypt from "bcryptjs"
import { TRPCError } from "@trpc/server"
import { clearSessionData, saveSessionData } from "@/server/authHandlers"
import cryptoRandomString from "crypto-random-string"
import { sendPasswordReset, sendVerificationEmail } from "@/server/mail"

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

			if (!bcrypt.compareSync(input.password, user.password)) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Invalid email or password",
				})
			}

			await saveSessionData(ctx.res, user, null)

			return {
				user,
			}
		}),
	logout: publicProcedure.mutation(async ({ ctx }) => {
		await clearSessionData(ctx.req, ctx.res)
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

			const verificationToken = cryptoRandomString({ length: 64 })
			const user = await ctx.prisma.user.create({
				data: {
					email: input.email,
					password: await bcrypt.hash(input.password, 10),
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

			await saveSessionData(ctx.res, userVerification.User, null)

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

			const passwordResetToken = cryptoRandomString({ length: 64 })
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
					password: bcrypt.hashSync(input.password),
					passwordReset: {
						delete: true,
					},
				},
			})

			await saveSessionData(ctx.res, user, null)

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
