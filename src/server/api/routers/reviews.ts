import { z } from "zod"
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc"
import { userProtectedProcedure } from "@/server/api/auth"
import { UserAuthLevel } from "@/utils/types"

const reviewRouter = createTRPCRouter({
	getBookReviewData: publicProcedure
		.input(z.string().length(13))
		.query(async ({ ctx, input }) => {
			const bookData = await ctx.prisma.book.findUnique({
				where: {
					isbn: input,
				},
				include: {
					reviews: {
						include: {
							reviewAuthor: true,
						},
					},
				},
			})
			return bookData
		}),

	deleteReview: userProtectedProcedure
		.input(
			z.object({
				isbn: z.string().length(13),
				reviewAuthorId: z.number().optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const reviewAuthorId =
				ctx.user.authLevel === UserAuthLevel.Admin
					? input.reviewAuthorId || ctx.user.id
					: ctx.user.id
			await ctx.prisma.review.delete({
				where: {
					isbn_reviewAuthorId: {
						isbn: input.isbn,
						reviewAuthorId: reviewAuthorId,
					},
				},
			})

			return true
		}),
})

export default reviewRouter
