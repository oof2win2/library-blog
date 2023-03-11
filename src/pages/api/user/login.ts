import { apiValidation } from "@/middleware"
import { ApiRequest } from "@/utils/types"
import { NextApiResponse } from "next"
import nc from "next-connect"
import { db } from "@/utils/db"
import { LoginForm, LoginFormType } from "@/utils/validators/UserForms"
import bcrypt from "bcryptjs"
import { saveSessionData } from "@/utils/auth"

const handler = nc<ApiRequest, NextApiResponse>()

// POST /api/user/login
handler.post<ApiRequest<{ Body: LoginFormType }>>(
	apiValidation({ body: LoginForm }),
	async (req, res) => {
		//   const { email, password } = req.body as LoginFormType;
		const { email, password } = req.body

		const user = await db.user.findUnique({
			where: {
				email,
			},
		})

		if (!user) {
			return res.status(404).json({
				status: "error",
				errors: [
					{
						status: "error",
						statusCode: 404,
						message: "Email or password is wrong",
						description: "Email or password is wrong",
					},
				],
			})
		}

		const passwordMatch = await bcrypt.compare(password, user.password)

		if (!passwordMatch) {
			return res.status(404).json({
				status: "error",
				errors: [
					{
						statusCode: 404,
						message: "Email or password is wrong",
						description: "Email or password is wrong",
					},
				],
			})
		}

		await saveSessionData(res, user, null)

		return res.status(200).json({
			status: "success",
			data: user,
		})
	}
)

export default handler
