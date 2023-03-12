import {
	Button,
	Center,
	Container,
	Heading,
	Input,
	Text,
	FormControl,
	FormLabel,
	FormErrorMessage,
} from "@chakra-ui/react"
import Link from "next/link"
import { useEffect } from "react"
import { useFormik } from "formik"
import { PasswordResetRequestForm } from "@/utils/validators/UserForms"
import type { PasswordResetRequestFormType } from "@/utils/validators/UserForms"
import { toFormikValidationSchema } from "zod-formik-adapter"
import { useAppDispatch, useAppSelector } from "@/utils/redux/hooks"
import { useRouter } from "next/router"
import useSWRMutation from "swr/mutation"

export default function PasswordReset() {
	const dispatch = useAppDispatch()
	const { user } = useAppSelector((state) => state.user)
	const router = useRouter()
	const { trigger: sendResetRequest, data: resetRequest } = useSWRMutation(
		"/api/user/passwordreset",
		async (url, { arg }: { arg: { email: string } }) => {
			const x = await fetch(url, {
				method: "PUT",
				body: JSON.stringify(arg),
				headers: {
					"Content-Type": "application/json",
				},
			})
			return await x.json()
		}
	)
	const { setFieldValue, submitForm, errors } =
		useFormik<PasswordResetRequestFormType>({
			initialValues: {
				email: "",
			},
			validationSchema: toFormikValidationSchema(
				PasswordResetRequestForm
			),
			onSubmit: async ({ email }) => sendResetRequest({ email }),
		})

	useEffect(() => {
		if (user) {
			router.push("/")
		}
	}, [])

	if (resetRequest?.status === "success") {
		return (
			<Container maxW="60ch">
				<Center flexDir="column">
					<Heading m={5}>Password Reset</Heading>
					<Text>
						Please check your email and click the link to reset your
						password
					</Text>
				</Center>
			</Container>
		)
	} else if (resetRequest?.status === "error") {
		return (
			<Container maxW="60ch">
				<Center flexDir="column">
					<Heading m={5}>Password Reset</Heading>
					<Text>
						An error occurred while trying to reset your password
					</Text>
				</Center>
			</Container>
		)
	}

	return (
		<Container maxW="60ch">
			<Center flexDir="column">
				<Heading m={5}>Password Reset</Heading>
				<Text>
					Don&apos;t have an account?{" "}
					<Link
						href="/user/signup"
						style={{ textDecoration: "underline" }}
					>
						Sign up here
					</Link>
				</Text>
				<FormControl isInvalid={Boolean(errors.email)} isRequired m={2}>
					<FormLabel htmlFor="email">Email</FormLabel>
					<Input
						type="email"
						name="email"
						onChange={(e) => setFieldValue("email", e.target.value)}
					/>
					<FormErrorMessage>{errors.email}</FormErrorMessage>
				</FormControl>
				<Button onClick={() => submitForm()}>Submit</Button>
			</Center>
		</Container>
	)
}
