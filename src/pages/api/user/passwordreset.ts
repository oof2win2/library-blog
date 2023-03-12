import { ApiRequest } from "@/utils/types"
import { NextApiResponse } from "next"
import nc from "next-connect"
import { db } from "@/utils/db"
import { apiValidation } from "@/middleware"
import {
	PasswordResetForm,
	PasswordResetRequestForm,
	PasswordResetRequestFormType,
} from "@/utils/validators/UserForms"
import cryptoRandomString from "crypto-random-string"
import { sendPasswordReset } from "@/utils/mail"
import bcrypt from "bcryptjs"

const handler = nc<ApiRequest, NextApiResponse>()

// PUT /api/user/passwordreset
handler.put<ApiRequest>(
	apiValidation({ body: PasswordResetRequestForm }),
	async (req, res) => {
		const { email } = req.body as PasswordResetRequestFormType

		const foundUser = await db.user.findUnique({
			where: {
				email,
			},
		})

		// if there isnt a user, we send a success message to prevent email enumeration
		if (!foundUser) {
			return res.status(200).json({
				status: "success",
			})
		}

		const passwordResetToken = cryptoRandomString({ length: 64 })

		const user = await db.user.update({
			where: {
				email,
			},
			data: {
				passwordReset: {
					create: {
						email,
						token: passwordResetToken,
					},
				},
			},
		})

		// now we send an email to the user
		sendPasswordReset(user, passwordResetToken)

		return res.status(200).json({
			status: "success",
		})
	}
)

handler.post<ApiRequest>(
	apiValidation({ body: PasswordResetForm }),
	async (req, res) => {
		const { token, password } = req.body

		const foundPasswordReset = await db.passwordReset.findUnique({
			where: {
				token,
			},
		})

		if (!foundPasswordReset || foundPasswordReset.userId === null) {
			return res.status(400).json({
				status: "error",
				message: "Invalid token",
			})
		}

		await db.user.update({
			where: {
				id: foundPasswordReset.userId,
			},
			data: {
				password: bcrypt.hashSync(password),
				passwordReset: {
					delete: true,
				},
			},
		})
		return res.status(200).json({
			status: "success",
		})
	}
)

export default handler
