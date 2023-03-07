import { apiValidation, authAPI } from "@/middleware"
import { ApiRequest, ApiResponse, PopulatedApiRequest } from "@/utils/types"
import { NextApiResponse } from "next"
import nc from "next-connect"
import { GET_ISBN_params, POST_ISBN_body } from "./index.types"
import { db } from "@/utils/db"

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
handler.delete<ApiRequest<{ Query: GET_ISBN_params }>>(
	apiValidation({ query: GET_ISBN_params }),
	authAPI,
	async (req, res) => {
		const { isbn } = req.query

		if (!req.populated)
			return res.status(500).json({
				status: "error",
				statusCode: 500,
				message: "Internal Server Error",
				description: "You are not logged in",
			})

		const review = await db.review.delete({
			where: {
				isbn_reviewAuthorId: {
					isbn: isbn.toString(),
					reviewAuthorId: req.user.id,
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

// POST /api/reviews/:isbn
handler.post<ApiRequest<{ Body: POST_ISBN_body }>>(
	apiValidation({ body: POST_ISBN_body }),
	authAPI,
	async (req, res) => {
		if (!req.populated)
			return res.status(500).json({
				status: "error",
				statusCode: 500,
				message: "Internal Server Error",
				description: "You are not logged in",
			})
		const body = req.body as POST_ISBN_body

		const review = await db.review.create({
			data: {
				isbn: body.isbn,
				rating: body.rating,
				reviewText: body.review,
				reviewPublished: true,
				reviewAuthorId: req.user.id,
			},
		})

		return res.status(200).json({
			status: "success",
			data: {
				review,
			},
		})
	}
)

export default handler
