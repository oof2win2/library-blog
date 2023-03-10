import { apiValidation } from "@/middleware"
import { ApiRequest, ApiResponse, PopulatedApiRequest } from "@/utils/types"
import { NextApiResponse } from "next"
import nc from "next-connect"
import { GET_Base_query } from "./index.types"
import { db } from "@/utils/db"

const handler = nc<ApiRequest, NextApiResponse>()

// GET /api/books
handler.get<ApiRequest<{ Query: GET_Base_query }>>(
	apiValidation({ query: GET_Base_query }),
	async (req, res) => {
		const { page, amountPerPage, query } = req.query

		const books = query
			? await db.book.findMany({
					skip: page * amountPerPage,
					take: amountPerPage,
					where: {
						title: {
							search: query
								.split(" ")
								.map((x) => `+${x}`)
								.join(" "),
						},
					},
			  })
			: await db.book.findMany({
					skip: page * amountPerPage,
					take: amountPerPage,
			  })

		return res.status(200).json({
			status: "success",
			data: {
				length: books.length,
				books,
			},
		})
	}
)

export default handler
