import {
	Button,
	Center,
	Container,
	Divider,
	FormControl,
	FormErrorMessage,
	FormLabel,
	Heading,
	Input,
	Text,
	useToast,
} from "@chakra-ui/react"
import Link from "next/link"
import { useEffect } from "react"
import { useFormik } from "formik"
import { LoginForm } from "@/utils/validators/UserForms"
import type { LoginFormType } from "@/utils/validators/UserForms"
import { toFormikValidationSchema } from "zod-formik-adapter"
import { useDebouncedCallback } from "use-debounce"
import { useUserStore } from "@/utils/zustand"
import { api } from "@/utils/api"
import { useRouter } from "next/router"

export default function SignIn() {
	const toast = useToast()
	const { user, login } = useUserStore()
	const router = useRouter()

	const loginMutation = api.user.login.useMutation()

	const { setFieldValue, submitForm, errors } = useFormik<LoginFormType>({
		initialValues: {
			email: "",
			password: "",
		},
		validationSchema: toFormikValidationSchema(LoginForm),
		onSubmit: async ({ email, password }) => {
			loginMutation.mutate({ email, password })
		},
	})
	const debouncedSetFieldValue = useDebouncedCallback(
		(fieldName: string, fieldValue: string) => {
			setFieldValue(fieldName, fieldValue)
		},
		100
	)

	useEffect(() => {
		if (loginMutation.status === "success") {
			login(loginMutation.data.user)
			setTimeout(() => router.push("/"), 2000)
		}
	}, [loginMutation.data, loginMutation.status])

	useEffect(() => {
		if (loginMutation.status === "error" && loginMutation.error.data) {
			if (loginMutation.error.data.code === "NOT_FOUND")
				toast({
					title: "Invalid credentials",
					description:
						"The email or password you entered is incorrect",
					status: "error",
				})
			else
				toast({
					title: "An error occurred",
					description: "Please try again later",
					status: "error",
				})
		}
	}, [loginMutation.error, loginMutation.status])

	useEffect(() => {
		if (user) {
			router.push("/")
		}
	}, [])

	if (user) {
		return (
			<Container maxW="60ch">
				<Center flexDir="column">
					<Heading m={5}>Login</Heading>
					<Text>You will be redirected to the homepage soon</Text>
				</Center>
			</Container>
		)
	}

	return (
		<Container maxW="60ch">
			<Center flexDir="column">
				<Heading m={5}>Login</Heading>
				<Text>
					Don&apos;t have an account?{" "}
					<Link
						href="/user/signup"
						style={{ textDecoration: "underline" }}
					>
						Sign up here
					</Link>
				</Text>

				<FormControl
					isInvalid={Boolean(errors.email)}
					isRequired
					m={2}
					variant="floating"
				>
					<FormLabel>Email</FormLabel>
					<Input
						placeholder=" "
						type="email"
						onChange={(e) =>
							debouncedSetFieldValue("email", e.target.value)
						}
					/>
					<FormErrorMessage>{errors.email}</FormErrorMessage>
				</FormControl>
				<FormControl
					isInvalid={Boolean(errors.password)}
					isRequired
					m={2}
					variant="floating"
				>
					<FormLabel>Password</FormLabel>
					<Input
						type="password"
						placeholder=" "
						onChange={(e) => {
							debouncedSetFieldValue("password", e.target.value)
						}}
						isRequired
					/>
					<FormErrorMessage>{errors.password}</FormErrorMessage>
				</FormControl>
				<Button
					m={5}
					isDisabled={loginMutation.isLoading}
					onClick={() => submitForm()}
				>
					Login
				</Button>
				<Divider m={2} />
				<Text>
					Forgot your password? Reset it{" "}
					<Link
						href="/user/passwordreset"
						style={{ textDecoration: "underline" }}
					>
						here
					</Link>
				</Text>
			</Center>
		</Container>
	)
}
