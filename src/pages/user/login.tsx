import {
	Button,
	Center,
	Container,
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

export default function SignIn() {
	const dispatch = useAppDispatch()
	const { user } = useAppSelector((state) => state.user)
	const router = useRouter()
	const [reqError, setReqError] = useState<string | null>(null)
	const [success, setSuccess] = useState(false)
	const [loading, setLoading] = useState(false)
	const { setFieldValue, submitForm, errors } = useFormik<LoginFormType>({
		initialValues: {
			email: "",
			password: "",
		},
		validationSchema: toFormikValidationSchema(LoginForm),
		onSubmit: async ({ email, password }) => {
			setLoading(true)
			try {
				const res = await fetch("/api/user/login", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						email,
						password,
					}),
				})
				const json = await res.json()
				if (json.status === "success") {
					setSuccess(true)
					setReqError(null)
					dispatch(login(json.data))
					// go to homepage in 2s
					setTimeout(() => {
						router.push("/")
					}, 2000)
				}
				if (res.status !== 200) {
					const error = json.errors[0]
					if (!error) setReqError("An error occured")
					switch (error.message) {
						case "Email or password is wrong":
							setReqError(
								"Email address or password is wrong, please try again"
							)
							break
						default:
							setReqError("An unknown error occured")
					}
				}
			} catch (err) {
				console.error(reqError)
				setReqError("An error occured")
			}
			setLoading(false)
		},
	})
	const debouncedSetFieldValue = useDebouncedCallback(
		(fieldName: string, fieldValue: string) => {
			setFieldValue(fieldName, fieldValue)
		},
		100
	)

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
				<Button m={5} isDisabled={loading} onClick={() => submitForm()}>
					Login
				</Button>
			</Center>
		</Container>
	)
}
