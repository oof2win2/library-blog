import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/server/db"

export default async function handler(
	_req: NextApiRequest,
	res: NextApiResponse
) {
	await prisma.bookCount.deleteMany()
	const count = await prisma.book.count()
	await prisma.bookCount.create({
		data: {
			count: count,
			date: new Date(),
		},
	})
	res.status(200).json({ status: "success", message: "Keep alive succeeded" })
}
