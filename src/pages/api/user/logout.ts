import { authAPI } from "@/middleware"
import { ApiRequest, ApiResponse, PopulatedApiRequest } from "@/utils/types"
import { NextApiResponse } from "next"
import nc from "next-connect"
import { db } from "@/utils/db"
import { LoginForm, LoginFormType } from "@/utils/validators/UserForms"
import bcrypt from "bcryptjs"
import { clearSessionData, saveSessionData } from "@/utils/auth"

const handler = nc<ApiRequest, NextApiResponse>()

// POST /api/user/logout
handler.post<ApiRequest>(async (req, res) => {
	await clearSessionData(res)

	return res.status(200).json({
		status: "success",
		data: null,
	})
})

export default handler
