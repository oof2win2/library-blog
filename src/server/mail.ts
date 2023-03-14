import { Book, Review, User } from "@prisma/client"
import sendgrid from "@sendgrid/mail"
import { env } from "@/env.mjs"

sendgrid.setApiKey(env.SENDGRID_API_KEY)

export async function sendVerificationEmail(user: User, token: string) {
	const verificationLink = `${
		process.env.VERCEL_URL ? "https://" : "http://"
	}${process.env.VERCEL_URL || "localhost:3000"}/user/verify?token=${token}`

	await sendgrid.send({
		to: user.email,
		from: env.EMAIL_USERNAME,
		subject: "Bookaholic Blurbs: Verify your email",
		text: `Hello ${user.name},\n\nPlease verify your email by clicking the following link:\n\n${verificationLink}\n\nIf you did not request this, please ignore this email.\n\nRegards,\nBookaholic Blurbs`,
	})
}

export function notifyNewReview(
	book: Book,
	review: Review,
	user: User,
	admins: User[]
) {
	const emails = admins.map((admin) => {
		const text = `Hello ${admin.name},\n\n${user.name} has just reviewed ${book.title}.\n\n${review.reviewText}\n\nRegards,\nBookaholic Blurbs`
		return {
			to: admin.email,
			from: env.EMAIL_USERNAME,
			subject: `Bookaholic Blurbs: New review for ${book.title}`,
			text,
		}
	})

	// await sendgrid.sendMultiple(emails)
}

export async function sendPasswordReset(user: User, token: string) {
	const resetLink = `${process.env.VERCEL_URL ? "https://" : "http://"}${
		process.env.VERCEL_URL || "localhost:3000"
	}/user/passwordreset/new?token=${token}`
	await sendgrid.send({
		to: user.email,
		from: env.EMAIL_USERNAME,
		subject: "Bookaholic Blurbs: Reset your password",
		text: `Hello ${user.name},\n\nPlease reset your password by clicking the following link:\n\n${resetLink}\n\nIf you did not request this, please ignore this email.\n\nRegards,\nBookaholic Blurbs`,
	})
}
