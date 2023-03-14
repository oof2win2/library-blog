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
import { PasswordResetRequestForm } from "@/utils/validators/UserForms"
import type { PasswordResetRequestFormType } from "@/utils/validators/UserForms"
import { toFormikValidationSchema } from "zod-formik-adapter"
import { useRouter } from "next/router"
import { api } from "@/utils/api"
import { useUserStore } from "@/utils/zustand"

export default function PasswordReset() {
	const { user } = useUserStore()
	const toast = useToast()
	const router = useRouter()
	const passwordResetMutation = api.user.requestPasswordReset.useMutation()

	const { setFieldValue, submitForm, errors } =
		useFormik<PasswordResetRequestFormType>({
			initialValues: {
				email: "",
			},
			validationSchema: toFormikValidationSchema(
				PasswordResetRequestForm
			),
			onSubmit: async ({ email }) => passwordResetMutation.mutate(email),
		})

	useEffect(() => {
		if (user) {
			router.push("/")
		}
	}, [])
	useEffect(() => {
		if (passwordResetMutation.status === "success") {
			toast({
				title: "Password Reset",
				description:
					"Please check your email and click the link to reset your password",
				status: "success",
			})
		} else if (passwordResetMutation.status === "error") {
			toast({
				title: "Password Reset",
				description:
					"An error occurred while trying to reset your password",
				status: "error",
			})
		}
	}, [passwordResetMutation.status])

	if (passwordResetMutation.status === "success") {
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
	} else if (passwordResetMutation.status === "error") {
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
