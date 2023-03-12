import { z } from "zod"

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc"

const bookRouter = createTRPCRouter({
	getCount: publicProcedure
		.input(z.number().min(0).max(1000).optional().default(20))
		.query(async ({ ctx, input }) => {
			return await ctx.prisma.book.findMany({
				take: input,
			})
		}),
	getId: publicProcedure.input(z.string()).query(({ ctx, input }) => {
		return ctx.prisma.book.findUnique({
			where: {
				isbn: input,
			},
		})
	}),
})

export default bookRouter
