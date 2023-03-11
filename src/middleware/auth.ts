import { getSessionData } from "@/utils/auth"
import { ApiRequest, UserAuthLevel } from "@/utils/types"
import { NextApiRequest, NextApiResponse } from "next"
import { NextHandler } from "next-connect"
import ENV from "@/utils/env"

/**
 * Check if a user is authenticated and if so, allow them to access the page.
 * API use only currently
 */
export default function authAPI(
	permissions: UserAuthLevel = UserAuthLevel.User
) {
	return async function (
		req: ApiRequest,
		res: NextApiResponse,
		next: NextHandler
	) {
		const sessionData = await getSessionData(req.cookies)
		if (!sessionData) {
			return res.status(401).json({
				status: "error",
				statusCode: 401,
				message: "Unauthorized",
				description: "You must be logged in to access this resource.",
			})
		}
		console.log(sessionData.user.authLevel, permissions)
		if (sessionData.user.authLevel < permissions) {
			return res.status(401).json({
				status: "error",
				statusCode: 401,
				message: "Unauthorized",
				description:
					"You do not have sufficient permissions to access this resource.",
			})
		}

		req.populated = true
		if (req.populated) {
			req.sessionData = sessionData
			req.user = sessionData.user
		}
		next()
	}
}
