import { Book, Review, User } from "@prisma/client"
import nodemailer from "nodemailer"
import ENV from "./env"

const transport = nodemailer.createTransport({
	pool: true,
	host: "smtp.gmail.com",
	port: 465,
	secure: true, // use TLS
	auth: {
		user: ENV.EMAIL_USERNAME,
		pass: ENV.EMAIL_PASSWORD,
	},
})

export async function sendVerificationEmail(user: User, token: string) {
	const verificationLink = `${
		process.env.VERCEL_URL || "localhost:3000"
	}/user/verify?token=${token}`
	transport.sendMail({
		to: user.email,
		from: ENV.EMAIL_USERNAME,
		subject: "Bookaholic Blurbs: Verify your email",
		text: `Hello ${user.name},\n\nPlease verify your email by clicking the following link:\n\n${verificationLink}\n\nIf you did not request this, please ignore this email.\n\nRegards,\nBookaholic Blurbs`,
	})
}
