import { ApiRequest } from "@/utils/types"
import { NextApiResponse } from "next"
import nc from "next-connect"
import { clearSessionData } from "@/utils/auth"

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
