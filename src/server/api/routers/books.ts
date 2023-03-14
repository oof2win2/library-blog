import { z } from "zod"
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc"
import { meiliSearchClient } from "@/utils/meilisearch/admin"
import { adminProtectedProcedure } from "../auth"
import { SearchBookType } from "@/utils/types"
import { TRPCError } from "@trpc/server"

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

	addBook: adminProtectedProcedure
		.input(z.string())
		.mutation(async ({ ctx, input }) => {
			const books = (await fetch(
				`https://www.googleapis.com/books/v1/volumes?q=isbn:${input}`
			).then((x) => x.json())) as GoogleBooksAPIVolumeListResponse
			if (books.totalItems === 0)
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "No books found with that ISBN",
				})
			const book = books.items[0]
			if (!book)
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "No books found with that ISBN",
				})
			const foundISBN = book.volumeInfo.industryIdentifiers.find(
				(x) => x.type === "ISBN_13"
			)?.identifier
			if (!foundISBN || foundISBN !== input)
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "No books found with that ISBN",
				})

			const existingBook = await ctx.prisma.book.findUnique({
				where: {
					isbn: input,
				},
			})
			if (existingBook)
				throw new TRPCError({
					code: "CONFLICT",
					message: "A book with that ISBN already exists",
				})

			const dbBook = await ctx.prisma.book.create({
				data: {
					isbn: input,
					title: book.volumeInfo.title,
					subtitle: book.volumeInfo.subtitle || null,
					publisher: book.volumeInfo.publisher || null,
					publishedYear: book.volumeInfo.publishedDate
						? new Date(book.volumeInfo.publishedDate).getFullYear()
						: -1,
					authors: book.volumeInfo.authors?.join(";"),
					smallThumbnail:
						book.volumeInfo.imageLinks?.smallThumbnail || null,
					largeThumbnail:
						book.volumeInfo.imageLinks?.thumbnail || null,
				},
			})
			const index = meiliSearchClient.index("book")
			const document: SearchBookType = {
				isbn: dbBook.isbn,
				title: dbBook.title,
				subtitle: dbBook.subtitle,
				authors: dbBook.authors,
				smallThumbnail: dbBook.smallThumbnail,
				largeThumbnail: dbBook.largeThumbnail,
			}
			await index.addDocuments([document])
			return book
		}),

	removeBook: adminProtectedProcedure
		.input(z.string())
		.mutation(async ({ ctx, input }) => {
			const book = await ctx.prisma.book.findUnique({
				where: {
					isbn: input,
				},
			})
			if (!book)
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "No books found with that ISBN",
				})
			await ctx.prisma.review.deleteMany({
				where: {
					isbn: input,
				},
			})
			await ctx.prisma.book.delete({
				where: {
					isbn: input,
				},
			})
			const index = meiliSearchClient.index("book")
			await index.deleteDocument(input)
			return true
		}),
})

export default bookRouter
