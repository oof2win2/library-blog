import { z } from "zod"
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc"
import { userProtectedProcedure } from "@/server/api/auth"
import { UserAuthLevel } from "@/utils/types"
import bcrypt from "bcryptjs"
import { TRPCError } from "@trpc/server"
import { clearSessionData } from "@/server/authHandlers"

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

			return {
				user,
			}
		}),
	logout: publicProcedure.mutation(async ({ ctx }) => {
		await clearSessionData(ctx.req, ctx.res)
	}),
})

export default userRouter
