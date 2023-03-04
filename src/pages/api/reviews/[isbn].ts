import { apiValidation } from "@/middleware"
import { ApiRequest, ApiResponse, PopulatedApiRequest } from "@/utils/types"
import { NextApiResponse } from "next"
import nc from "next-connect"
import { GET_ISBN_params } from "./index.types"
import { db } from "@/utils/db"

const handler = nc<ApiRequest, NextApiResponse>()

// GET /api/reviews/:isbn/:userId
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

export default handler
