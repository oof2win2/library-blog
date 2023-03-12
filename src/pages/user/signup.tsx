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
import { useEffect, useState } from "react"
import { useFormik } from "formik"
import { SignupForm, SignupFormType } from "@/utils/validators/UserForms"
import { toFormikValidationSchema } from "zod-formik-adapter"
import { useDebouncedCallback } from "use-debounce"
import { useAppSelector } from "@/utils/redux/hooks"
import { useRouter } from "next/router"
import useSWRMutation from "swr/mutation"

export default function SignUp() {
	const { user } = useAppSelector((state) => state.user)
	const router = useRouter()
	const [error, setError] = useState<string | null>(null)
	const {
		trigger: sendSignup,
		data: signupData,
		isMutating: loading,
	} = useSWRMutation(
		"/api/user/signup",
		async (
			url,
			{ arg }: { arg: { email: string; password: string; name: string } }
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
	const { setFieldValue, submitForm, errors } = useFormik<SignupFormType>({
		initialValues: {
			email: "",
			password: "",
			name: "",
		},
		validationSchema: toFormikValidationSchema(SignupForm),
		onSubmit: async ({ email, password, name }) =>
			sendSignup({ email, password, name }),
	})
	const debouncedSetFieldValue = useDebouncedCallback(
		(fieldName: string, fieldValue: string) => {
			setFieldValue(fieldName, fieldValue)
		},
		100
	)

	useEffect(() => {
		if (signupData) {
			if (signupData.status !== "success") {
				setError(signupData.message)
			}
		}
	}, [signupData])

	useEffect(() => {
		if (user) {
			router.push("/")
		}
	}, [])

	if (signupData && signupData.status === "success") {
		return (
			<Container maxW="60ch">
				<Center flexDir="column">
					<Heading m={5}>Signup</Heading>
					<Text>
						Please check your email and verify it by clicking on the
						link
					</Text>
				</Center>
			</Container>
		)
	}

	return (
		<Container maxW="60ch">
			<Center flexDir="column">
				<Heading m={5}>Signup</Heading>
				<Text>{error}</Text>
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
				<FormControl
					isInvalid={Boolean(errors.name)}
					isRequired
					m={2}
					variant="floating"
				>
					<FormLabel>Your name</FormLabel>
					<Input
						placeholder="Bob Smith"
						onChange={(e) => {
							debouncedSetFieldValue("name", e.target.value)
						}}
						isRequired
					/>
					<FormErrorMessage>{errors.name}</FormErrorMessage>
				</FormControl>
				<Button m={5} isDisabled={loading} onClick={() => submitForm()}>
					Signup
				</Button>
			</Center>
		</Container>
	)
}
