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
	useToast,
} from "@chakra-ui/react"
import Link from "next/link"
import { useEffect } from "react"
import { useFormik } from "formik"
import { PasswordResetForm } from "@/utils/validators/UserForms"
import type { PasswordResetFormType } from "@/utils/validators/UserForms"
import { toFormikValidationSchema } from "zod-formik-adapter"
import { useRouter } from "next/router"
import { useUserStore } from "@/utils/zustand"
import { api } from "@/utils/api"

export default function PasswordReset() {
	const { user, login } = useUserStore()
	const toast = useToast()
	const router = useRouter()
	const resetPasswordMutation = api.user.resetPassword.useMutation()

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
				resetPasswordMutation.mutate({
					token: data.token,
					password: data.password,
				})
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

	useEffect(() => {
		if (resetPasswordMutation.status === "success") {
			setTimeout(() => router.push("/"), 3000)
			login(resetPasswordMutation.data)
			toast({
				title: "Password Reset",
				description: "Your password has been successfully reset.",
				status: "success",
			})
		}
	}, [resetPasswordMutation.status, resetPasswordMutation.data])
	useEffect(() => {
		if (resetPasswordMutation.status === "error") {
			toast({
				title: "Error resetting password",
				description: resetPasswordMutation.error?.message,
				status: "error",
			})
		}
	}, [resetPasswordMutation.status, resetPasswordMutation.error])

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

	if (resetPasswordMutation.status === "success") {
		return (
			<Container maxW="60ch">
				<Center flexDir="column">
					<Heading m={5}>Password Reset</Heading>
					<Text>
						Your password has been successfully reset. You have been
						logged in and will be redirected to the home page soon.
					</Text>
				</Center>
			</Container>
		)
	} else if (resetPasswordMutation.status === "error") {
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
				<Button
					onClick={() => submitForm()}
					isDisabled={resetPasswordMutation.isLoading}
				>
					Submit
				</Button>
			</Center>
		</Container>
	)
}
