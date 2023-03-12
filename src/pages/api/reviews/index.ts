import { apiValidation } from "@/middleware"
import { ApiRequest } from "@/utils/types"
import { NextApiResponse } from "next"
import nc from "next-connect"
import { GET_Base_query } from "./index.types"
import { db } from "@/utils/db"

const handler = nc<ApiRequest, NextApiResponse>()

// GET /api/reviews
handler.get<ApiRequest<{ Query: GET_Base_query }>>(
	apiValidation({ query: GET_Base_query }),
	async (req, res) => {
		const { page, amountPerPage } = req.query

		const reviews = await db.review.findMany({
			skip: page * amountPerPage,
			take: amountPerPage,
		})

		return res.status(200).json({
			status: "success",
			data: {
				length: reviews.length,
				reviews,
			},
		})
	}
)

export default handler

export const config = {
	runtime: "edge",
}
