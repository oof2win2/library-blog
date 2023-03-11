import { apiValidation, authAPI } from "@/middleware"
import { ApiRequest, UserAuthLevel } from "@/utils/types"
import { NextApiResponse } from "next"
import nc from "next-connect"
import { db } from "@/utils/db"
import { PUT_AllowedDomains_Body } from "./index.types"

const handler = nc<ApiRequest, NextApiResponse>()

// PUT /api/admins/allowed-domains
handler.put<ApiRequest<{ Body: PUT_AllowedDomains_Body }>>(
	apiValidation({ body: PUT_AllowedDomains_Body }),
	authAPI(UserAuthLevel.Admin),
	async (req, res) => {
		const { domain } = req.body as PUT_AllowedDomains_Body

		await db.allowedDomain.create({
			data: {
				domain,
			},
		})
		return res.status(200).json({
			status: "success",
			data: {
				domain,
			},
		})
	}
)

// DELETE /api/admins/allowed-domains
handler.delete<ApiRequest<{ Body: PUT_AllowedDomains_Body }>>(
	apiValidation({ body: PUT_AllowedDomains_Body }),
	authAPI(UserAuthLevel.Admin),
	async (req, res) => {
		const { domain } = req.body as PUT_AllowedDomains_Body

		await db.allowedDomain.delete({
			where: {
				domain,
			},
		})
		return res.status(200).json({
			status: "success",
			data: {
				domain,
			},
		})
	}
)
export default handler
