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
import { PasswordResetForm } from "@/utils/validators/UserForms"
import type { PasswordResetFormType } from "@/utils/validators/UserForms"
import { toFormikValidationSchema } from "zod-formik-adapter"
import { useAppDispatch, useAppSelector } from "@/utils/redux/hooks"
import { useRouter } from "next/router"
import useSWRMutation from "swr/mutation"

export default function PasswordReset() {
	const { user } = useAppSelector((state) => state.user)
	const router = useRouter()
	const {
		trigger: resetPassword,
		data: resetPasswordData,
		isMutating: loading,
	} = useSWRMutation(
		"/api/user/passwordreset",
		async (
			url,
			{
				arg,
			}: {
				arg: {
					password: string
					passwordConfirm: string
					token: string
				}
			}
		) => {
			const x = await fetch(url, {
				method: "POST",
				body: JSON.stringify(arg),
				headers: {
					"Content-Type": "application/json",
				},
			})
			return await x.json()
		}
	)
	const token = router.query.token
		? Array.isArray(router.query.token)
			? router.query.token[0]
			: router.query.token
		: ""

	const { setFieldValue, submitForm, errors, values } =
		useFormik<PasswordResetFormType>({
			initialValues: {
				password: "",
				passwordConfirm: "",
				token: "",
			},
			validationSchema: toFormikValidationSchema(PasswordResetForm),
			onSubmit: (data) => {
				resetPassword(data)
			},
		})
	useEffect(() => {
		if (user) {
			router.push("/")
		}
	}, [])
	useEffect(() => {
		setFieldValue("token", token)
	}, [token])

	if (!token) {
		return (
			<Container maxW="60ch">
				<Center flexDir="column">
					<Heading m={5}>Password Reset</Heading>
					<Text>
						Please try to access the link in your email again
					</Text>
				</Center>
			</Container>
		)
	}

	if (resetPasswordData?.status === "success") {
		return (
			<Container maxW="60ch">
				<Center flexDir="column">
					<Heading m={5}>Password Reset</Heading>
					<Text>
						Your password has been successfully reset. You can now{" "}
						<Link
							href="/user/login"
							style={{ textDecoration: "underline" }}
						>
							login
						</Link>
					</Text>
				</Center>
			</Container>
		)
	} else if (resetPasswordData?.status === "error") {
		return (
			<Container maxW="60ch">
				<Center flexDir="column">
					<Heading m={5}>Password Reset</Heading>
					<Text>
						An error occurred while trying to reset your password.
						Please try to access the link in your email again
					</Text>
				</Center>
			</Container>
		)
	}

	return (
		<Container maxW="60ch">
			<Center flexDir="column">
				<Heading m={5}>Password Reset</Heading>

				<FormControl
					isInvalid={Boolean(errors.password)}
					isRequired
					m={2}
				>
					<FormLabel htmlFor="email">Password</FormLabel>
					<Input
						type="password"
						name="password"
						onChange={(e) =>
							setFieldValue("password", e.target.value)
						}
					/>
					<FormErrorMessage>{errors.password}</FormErrorMessage>
				</FormControl>

				<FormControl
					isInvalid={Boolean(errors.passwordConfirm)}
					isRequired
					m={2}
				>
					<FormLabel htmlFor="email">Password Confirmation</FormLabel>
					<Input
						type="password"
						name="passwordConfirm"
						onChange={(e) =>
							setFieldValue("passwordConfirm", e.target.value)
						}
					/>
					<FormErrorMessage>
						{errors.passwordConfirm}
					</FormErrorMessage>
				</FormControl>
				<Button onClick={() => submitForm()} isDisabled={loading}>
					Submit
				</Button>
			</Center>
		</Container>
	)
}
