import { apiValidation } from "@/middleware"
import { ApiRequest } from "@/utils/types"
import { NextApiResponse } from "next"
import nc from "next-connect"
import { db } from "@/utils/db"
import { z } from "zod"
import { saveSessionData } from "@/utils/auth"

const handler = nc<ApiRequest, NextApiResponse>()

const PUT_Verify_params = z.object({
	token: z.string().length(64),
})
type PUT_Verify_params = z.infer<typeof PUT_Verify_params>

// POST /api/user/verify
handler.post<ApiRequest>(
	apiValidation({ query: PUT_Verify_params }),
	async (req, res) => {
		const { token } = req.query as PUT_Verify_params

		const userVerification = await db.userVerification.findUnique({
			where: {
				token,
			},
			include: {
				User: true,
			},
		})

		if (!userVerification || !userVerification.User) {
			return res.status(404).json({
				status: "error",
				message: "Invalid verification token",
			})
		}

		await db.user.update({
			where: {
				id: userVerification.User.id,
			},
			data: {
				userVerification: {
					delete: true,
				},
			},
		})

		await saveSessionData(res, userVerification.User, null)

		return res.status(200).json({
			status: "success",
			data: userVerification.User,
		})
	}
)

export default handler
