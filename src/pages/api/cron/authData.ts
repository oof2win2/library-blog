import { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/utils/db"
import cryptoRandomString from "crypto-random-string"

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	await db.passwordReset.deleteMany({
		where: {
			OR: [
				{
					expiresAt: {
						lt: new Date(),
					},
				},
				{
					userId: null,
				},
			],
		},
	})

	await db.user.deleteMany({
		where: {
			userVerification: {
				expiresAt: {
					lt: new Date(),
				},
			},
		},
	})

	await db.userVerification.deleteMany({
		where: {
			OR: [
				{
					expiresAt: {
						lt: new Date(),
					},
				},
				{
					userId: null,
				},
			],
		},
	})

	await db.session.deleteMany({
		where: {
			exp: {
				lt: Math.floor(Date.now() / 1000),
			},
		},
	})

	return res
		.status(200)
		.json({ status: "success", message: "Cron job ran successfully" })
}
