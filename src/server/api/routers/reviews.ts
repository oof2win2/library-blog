import { z } from "zod"
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc"
import { userProtectedProcedure } from "@/server/api/auth"
import { UserAuthLevel } from "@/utils/types"
import { notifyNewReview } from "@/server/mail"

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

	createReview: userProtectedProcedure
		.input(
			z.object({
				isbn: z.string().length(13),
				reviewText: z.string().min(1),
				rating: z.number().min(1).max(5),
				threeWords: z
					.string()
					.refine(
						(v) => v.split(" ").length === 3,
						"Must be three words"
					),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const reviewAuthorId = ctx.user.id
			const review = await ctx.prisma.review.create({
				data: {
					isbn: input.isbn,
					reviewText: input.reviewText,
					rating: input.rating,
					reviewAuthorId: reviewAuthorId,
					threeWords: input.threeWords,
				},
				include: {
					Book: true,
					reviewAuthor: true,
				},
			})

			const admins = await ctx.prisma.user.findMany({
				where: {
					authLevel: UserAuthLevel.Admin,
				},
			})

			await notifyNewReview(
				review.Book,
				review,
				review.reviewAuthor,
				admins
			)

			return {
				...review,
				reviewAuthor: null, // as to not expose password and email
			}
		}),
})

export default reviewRouter
