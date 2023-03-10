import { apiValidation, authAPI } from "@/middleware"
import { ApiRequest, UserAuthLevel } from "@/utils/types"
import { NextApiResponse } from "next"
import nc from "next-connect"
import { db } from "@/utils/db"
import { PUT_Base_Body } from "./index.types"

const handler = nc<ApiRequest, NextApiResponse>()

// PUT /api/admins
handler.put<ApiRequest<{ Body: PUT_Base_Body }>>(
	apiValidation({ body: PUT_Base_Body }),
	authAPI(UserAuthLevel.Admin),
	async (req, res) => {
		const { email } = req.body as PUT_Base_Body

		const user = await db.user.findUnique({
			where: {
				email,
			},
		})
		if (!user)
			return res.status(404).json({
				status: "error",
				statusCode: 404,
				message: "Not Found",
				description: "No user with that email exists.",
			})

		if (user.authLevel === UserAuthLevel.Admin)
			return res.status(400).json({
				status: "error",
				statusCode: 400,
				message: "Bad Request",
				description: "User is already an admin.",
			})

		await db.user.update({
			where: {
				email,
			},
			data: {
				authLevel: UserAuthLevel.Admin,
			},
		})

		return res.status(200).json({
			status: "success",
			data: {
				user: {
					...user,
					password: null,
				},
			},
		})
	}
)

handler.delete<ApiRequest<{ Body: PUT_Base_Body }>>(
	apiValidation({ body: PUT_Base_Body }),
	authAPI(UserAuthLevel.Admin),
	async (req, res) => {
		const { email } = req.body as PUT_Base_Body

		const user = await db.user.findUnique({
			where: {
				email,
			},
		})
		if (!user)
			return res.status(404).json({
				status: "error",
				statusCode: 404,
				message: "Not Found",
				description: "No user with that email exists.",
			})

		if (user.authLevel !== UserAuthLevel.Admin)
			return res.status(400).json({
				status: "error",
				statusCode: 400,
				message: "Bad Request",
				description: "User is not an admin.",
			})

		await db.user.update({
			where: {
				email,
			},
			data: {
				authLevel: UserAuthLevel.User,
			},
		})

		return res.status(200).json({
			status: "success",
			data: {
				userId: user.id,
			},
		})
	}
)
export default handler
