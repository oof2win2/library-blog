import { apiValidation } from "@/middleware"
import { ApiRequest } from "@/utils/types"
import { NextApiResponse } from "next"
import nc from "next-connect"
import { db } from "@/utils/db"
import { SignupForm, SignupFormType } from "@/utils/validators/UserForms"
import bcrypt from "bcryptjs"
import { saveSessionData } from "@/utils/auth"

const handler = nc<ApiRequest, NextApiResponse>()

// POST /api/user/signup
handler.post<ApiRequest<{ Body: SignupFormType }>>(
	apiValidation({ body: SignupForm }),
	async (req, res) => {
		const { email, password, name } = req.body as SignupFormType

		const foundUser = await db.user.findUnique({
			where: {
				email,
			},
		})

		if (foundUser) {
			return res.status(404).json({
				status: "error",
				message: "A user with this email is already registered",
			})
		}

		const allowedDomains = await db.allowedDomain.findMany()
		const isAllowedDomain = allowedDomains.find((d) => {
			if (email.endsWith(d.domain)) {
				return true
			}
		})
		if (!isAllowedDomain) {
			return res.status(404).json({
				status: "error",
				message:
					"This email domain is not allowed. Please contact an administrator if you think this is a mistake.",
			})
		}

		const user = await db.user.create({
			data: {
				email,
				password: await bcrypt.hash(password, 10),
				name,
			},
		})

		await saveSessionData(res, user, null)

		return res.status(200).json({
			status: "success",
			data: user,
		})
	}
)

export default handler
