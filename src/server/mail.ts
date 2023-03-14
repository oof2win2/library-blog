import { Book, Review, User } from "@prisma/client"
import { env } from "@/env.mjs"

const sendMail = async (to: string, subject: string, text: string) => {
	await fetch("https://api.sendgrid.com/v3/mail/send", {
		method: "POST",
		body: JSON.stringify({
			personalizations: [
				{
					to: [
						{
							email: to,
						},
					],
				},
			],
			from: {
				email: env.EMAIL_USERNAME,
			},
			subject: subject,
			// the email body
			content: [
				{
					type: "text/plain",
					value: text,
				},
			],
		}),
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${env.SENDGRID_API_KEY}`,
		},
	})
}

export async function sendVerificationEmail(user: User, token: string) {
	const qs = new URLSearchParams()
	// auto URL encode the bcrypt hashed token
	qs.append("token", token)
	const verificationLink = `${
		process.env.VERCEL_URL ? "https://" : "http://"
	}${process.env.VERCEL_URL || "localhost:3000"}/user/verify?${qs}`

	await sendMail(
		user.email,
		"Bookaholic Blurbs: Verify your email",
		`Hello ${user.name},\n\nPlease verify your email by clicking the following link:\n\n${verificationLink}\n\nIf you did not request this, please ignore this email.\n\nRegards,\nBookaholic Blurbs`
	)
}

export function notifyNewReview(
	book: Book,
	review: Review,
	user: User,
	admins: User[]
) {
	for (const admin of admins) {
		const text = `Hello ${admin.name},\n\n${user.name} has just reviewed ${book.title}.\n\n${review.reviewText}\n\nRegards,\nBookaholic Blurbs`
		sendMail(
			admin.email,
			`Bookaholic Blurbs: New review for ${book.title}`,
			text
		)
	}
}

export async function sendPasswordReset(user: User, token: string) {
	const qs = new URLSearchParams()
	// auto URL encode the bcrypt hashed token
	qs.append("token", token)
	const resetLink = `${process.env.VERCEL_URL ? "https://" : "http://"}${
		process.env.VERCEL_URL || "localhost:3000"
	}/user/passwordreset/new?${qs}`
	const text = `Hello ${user.name},\n\nPlease reset your password by clicking the following link:\n\n${resetLink}\n\nIf you did not request this, please ignore this email.\n\nRegards,\nBookaholic Blurbs`
	sendMail(user.email, "Bookaholic Blurbs: Reset your password", text)
}
