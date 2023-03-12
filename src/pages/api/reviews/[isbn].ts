import { apiValidation, authAPI } from "@/middleware"
import { ApiRequest, UserAuthLevel } from "@/utils/types"
import { NextApiResponse } from "next"
import nc from "next-connect"
import {
	GET_ISBN_params,
	PUT_ISBN_body,
	DELETE_ISBN_query,
	PUT_ISBN_query,
} from "./index.types"
import { db } from "@/utils/db"
import { notifyNewReview } from "@/utils/mail"

const handler = nc<ApiRequest, NextApiResponse>()

// GET /api/reviews/:isbn
handler.get<ApiRequest<{ Query: GET_ISBN_params }>>(
	apiValidation({ query: GET_ISBN_params }),
	async (req, res) => {
		const { isbn } = req.query

		const reviews = await db.review.findMany({
			where: {
				isbn: isbn.toString(),
			},
		})

		return res.status(200).json({
			status: "success",
			data: {
				reviews: reviews,
			},
		})
	}
)

// DELETE /api/reviews/:isbn
handler.delete<ApiRequest<{ Query: DELETE_ISBN_query }>>(
	apiValidation({ query: DELETE_ISBN_query }),
	authAPI(UserAuthLevel.User),
	async (req, res) => {
		const { isbn, reviewAuthorId } = req.query

		if (!req.populated)
			return res.status(500).json({
				status: "error",
				statusCode: 500,
				message: "Internal Server Error",
				description: "You are not logged in",
			})

		// delete of query first or user if the user is admin
		const authorId =
			req.user.authLevel === UserAuthLevel.Admin
				? reviewAuthorId || req.user.id
				: req.user.id

		const review = await db.review.delete({
			where: {
				isbn_reviewAuthorId: {
					isbn: isbn.toString(),
					reviewAuthorId: authorId,
				},
			},
		})
		if (!review) {
			return res.status(404).json({
				status: "error",
				statusCode: 404,
				message: "Not Found",
				description: "Review not found",
			})
		}

		return res.status(200).json({
			status: "success",
			data: {
				review,
			},
		})
	}
)

// PUT /api/reviews/:isbn
handler.put<ApiRequest<{ Body: PUT_ISBN_body; Query: PUT_ISBN_query }>>(
	apiValidation({ body: PUT_ISBN_body, query: PUT_ISBN_query }),
	authAPI(UserAuthLevel.User),
	async (req, res) => {
		if (!req.populated)
			return res.status(500).json({
				status: "error",
				statusCode: 500,
				message: "Internal Server Error",
				description: "You are not logged in",
			})
		const body = req.body as PUT_ISBN_body

		const review = await db.review.create({
			data: {
				isbn: req.query.isbn,
				rating: body.rating,
				reviewText: body.reviewText,
				reviewPublished: true,
				reviewAuthorId: req.user.id,
				threeWords: body.threeWords,
			},
		})

		const book = await db.book.findUnique({
			where: {
				isbn: req.query.isbn,
			},
		})
		const admins = await db.user.findMany({
			where: {
				authLevel: UserAuthLevel.Admin,
			},
		})

		notifyNewReview(book, review, req.user, admins)

		return res.status(200).json({
			status: "success",
			data: {
				review,
			},
		})
	}
)

export default handler
