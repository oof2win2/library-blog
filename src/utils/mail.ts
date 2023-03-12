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

export async function notifyNewReview(
	book: Book | null,
	review: Review,
	user: User,
	admins: User[]
) {
	for (const admin of admins) {
		const text = `Hello ${admin.name},\n\n${user.name} has just reviewed ${book?.title}.\n\n${review.reviewText}\n\nRegards,\nBookaholic Blurbs`
		transport.sendMail({
			to: admin.email,
			from: ENV.EMAIL_USERNAME,
			subject: `Bookaholic Blurbs: New review for ${book?.title}`,
			text,
		})
	}
}
