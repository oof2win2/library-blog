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
} from "@chakra-ui/react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useFormik } from "formik"
import { LoginForm } from "@/utils/validators/UserForms"
import type { LoginFormType } from "@/utils/validators/UserForms"
import { toFormikValidationSchema } from "zod-formik-adapter"
import { useDebouncedCallback } from "use-debounce"
import { useAppDispatch, useAppSelector } from "@/utils/redux/hooks"
import { useRouter } from "next/router"
import { login } from "@/utils/redux/parts/user"
import useSWRMutation from "swr/mutation"

export default function SignIn() {
	const dispatch = useAppDispatch()
	const { user } = useAppSelector((state) => state.user)
	const router = useRouter()
	const [reqError, setReqError] = useState<string | null>(null)
	const [resetPassword, setResetPassword] = useState(false)
	const {
		trigger: sendLogin,
		data: loginData,
		isMutating: loginLoading,
	} = useSWRMutation(
		"/api/user/login",
		async (url, { arg }: { arg: { email: string; password: string } }) => {
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
	const { setFieldValue, submitForm, errors } = useFormik<LoginFormType>({
		initialValues: {
			email: "",
			password: "",
		},
		validationSchema: toFormikValidationSchema(LoginForm),
		onSubmit: async ({ email, password }) => sendLogin({ email, password }),
	})
	const debouncedSetFieldValue = useDebouncedCallback(
		(fieldName: string, fieldValue: string) => {
			setFieldValue(fieldName, fieldValue)
		},
		100
	)

	useEffect(() => {
		if (loginData) {
			if (loginData.status === "success") {
				dispatch(login(loginData.data))
			} else {
				setReqError(
					loginData.errors[0]?.message || "An unknown error occurred"
				)
			}
		}
	})

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

				<Text>{reqError}</Text>

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
					isDisabled={loginLoading}
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
