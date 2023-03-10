import RequireAuth from "@/components/RequireAuth"
import { getSessionData } from "@/utils/auth"
import { db } from "@/utils/db"
import { UserAuthLevel } from "@/utils/types"
import { EditAdminUser, EditAllowedDomain } from "@/utils/validators/UserForms"
import {
	Heading,
	Table,
	TableCaption,
	TableContainer,
	Thead,
	Tr,
	Th,
	Tbody,
	Container,
	Input,
	FormControl,
	FormLabel,
	FormErrorMessage,
	Button,
	Flex,
	FormHelperText,
	IconButton,
	AlertDialog,
	AlertDialogBody,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogOverlay,
	Divider,
	useToast,
} from "@chakra-ui/react"
import { User } from "@prisma/client"
import { Formik } from "formik"
import {
	GetServerSideProps,
	GetServerSidePropsContext,
	GetServerSidePropsResult,
	InferGetServerSidePropsType,
} from "next"
import { useEffect, useRef, useState } from "react"
import { toFormikValidationSchema } from "zod-formik-adapter"
import useSWRMutation from "swr/mutation"
import { DeleteIcon } from "@chakra-ui/icons"

interface AdminProps {
	admins: Omit<User, "password">[]
	allowedDomains: string[]
}

export default function Admin(
	props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
	const toast = useToast()
	const [admins, setAdmins] = useState(props.admins)
	const [allowedDomains, setAllowedDomains] = useState(props.allowedDomains)
	const [adminToRemove, setAdminToRemove] = useState("")
	const deleteCancelRef = useRef(null)
	const { trigger: promoteAdmin, data: promoteAdminData } = useSWRMutation(
		"/api/admins",
		(url, { arg }: { arg: string }) =>
			fetch(`${url}`, {
				method: "PUT",
				body: JSON.stringify({
					email: arg,
				}),
				headers: {
					"Content-Type": "application/json",
				},
			}).then((res) => res.json())
	)
	const { trigger: demoteAdmin, data: demoteAdminData } = useSWRMutation(
		"/api/admins",
		(url, { arg }: { arg: string }) =>
			fetch(`${url}`, {
				method: "DELETE",
				body: JSON.stringify({
					email: arg,
				}),
				headers: {
					"Content-Type": "application/json",
				},
			}).then((res) => res.json())
	)
	const { trigger: addAllowedDomain, data: addAllowedDomainData } =
		useSWRMutation(
			"/api/admins/allowed-domains",
			(url, { arg }: { arg: string }) =>
				fetch(url, {
					method: "PUT",
					body: JSON.stringify({ domain: arg }),
				}).then((res) => res.json())
		)
	const { trigger: removeAllowedDomain, data: removeAllowedDomainData } =
		useSWRMutation(
			"/api/admins/allowed-domains",
			(url, { arg }: { arg: string }) =>
				fetch(url, {
					method: "DELETE",
					body: JSON.stringify({ domain: arg }),
				}).then((res) => res.json())
		)

	useEffect(() => {
		if (demoteAdminData) {
			if (demoteAdminData.status === "success") {
				setAdmins(
					admins.filter(
						(admin) => admin.id !== demoteAdminData.data.userId
					)
				)
			} else {
				toast({
					title: "Error removing admin",
					description: demoteAdminData.message,
					status: "error",
				})
			}
		}
	}, [demoteAdminData])
	useEffect(() => {
		if (promoteAdminData) {
			if (promoteAdminData.status === "success") {
				setAdmins([...admins, promoteAdminData.data.user])
			}
		}
	}, [promoteAdminData])

	useEffect(() => {
		if (addAllowedDomainData) {
			if (addAllowedDomainData.status === "success") {
				setAllowedDomains([
					...allowedDomains,
					addAllowedDomainData.data,
				])
			}
		}
	}, [addAllowedDomainData])
	useEffect(() => {
		if (removeAllowedDomainData) {
			if (removeAllowedDomainData.status === "success") {
				setAllowedDomains(
					allowedDomains.filter(
						(domain) => domain !== removeAllowedDomainData.data
					)
				)
			}
		}
	}, [removeAllowedDomainData])

	return (
		<Container maxW="80ch">
			{/* demote admin alert dialog */}
			<AlertDialog
				isOpen={adminToRemove !== ""}
				leastDestructiveRef={deleteCancelRef}
				onClose={() => setAdminToRemove("")}
			>
				<AlertDialogOverlay>
					<AlertDialogContent>
						<AlertDialogHeader fontSize="lg" fontWeight="bold">
							Demote Admin
						</AlertDialogHeader>

						<AlertDialogBody>
							Are you sure? You can't undo this action afterwards.
						</AlertDialogBody>

						<AlertDialogFooter>
							<Button
								ref={deleteCancelRef}
								onClick={() => setAdminToRemove("")}
							>
								Cancel
							</Button>
							<Button
								colorScheme="red"
								onClick={() => {
									if (adminToRemove)
										demoteAdmin(adminToRemove)
									setAdminToRemove("")
								}}
								ml={3}
							>
								Delete
							</Button>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialogOverlay>
			</AlertDialog>

			<Heading>Admin users</Heading>
			<TableContainer>
				<Table variant="simple">
					<Thead>
						<Tr>
							<Th>Nameeeee</Th>
							<Th>Email</Th>
						</Tr>
					</Thead>
					<Tbody>
						{admins.map((admin) => (
							<Tr key={admin.id}>
								<Th>{admin.name}</Th>
								<Th>{admin.email}</Th>
								<Th>
									<IconButton
										onClick={() => {
											setAdminToRemove(admin.email)
										}}
										aria-label="Delete admin"
									>
										<DeleteIcon />
									</IconButton>
								</Th>
							</Tr>
						))}
					</Tbody>
				</Table>
			</TableContainer>
			<Heading size="md">Add admin</Heading>
			<Formik
				initialValues={{ email: "" }}
				validationSchema={toFormikValidationSchema(EditAdminUser)}
				onSubmit={(values) => promoteAdmin(values.email)}
			>
				{(props) => (
					<form onSubmit={props.handleSubmit}>
						<FormControl
							isRequired
							isInvalid={Boolean(props.errors.email)}
						>
							<FormLabel>
								Email of the user to set to admin
							</FormLabel>
							<Input
								type="email"
								onChange={props.handleChange}
								onBlur={props.handleBlur}
								value={props.values.email}
								name="email"
							/>
						</FormControl>
						<Button type="submit">Submit</Button>
					</form>
				)}
			</Formik>

			<Divider m={4} />

			<Heading>Allowed domains</Heading>
			<TableContainer>
				<Table variant="simple">
					<Thead>
						<Tr>
							<Th>Domain</Th>
						</Tr>
					</Thead>
					<Tbody>
						{props.allowedDomains.map((domain) => (
							<Tr key={domain}>
								<Th>{domain}</Th>
							</Tr>
						))}
					</Tbody>
				</Table>
			</TableContainer>
			<Heading size="md">Add allowed domain</Heading>
			<Formik
				initialValues={{ domain: "" }}
				validationSchema={toFormikValidationSchema(EditAllowedDomain)}
				onSubmit={(values) => addAllowedDomain(values.domain)}
			>
				{(props) => (
					<form onSubmit={props.handleSubmit}>
						<FormControl
							isRequired
							isInvalid={Boolean(props.errors.domain)}
						>
							<FormLabel>
								The ending of the domain (after the @ symbol)
							</FormLabel>
							<Input
								type="email"
								onChange={props.handleChange}
								onBlur={props.handleBlur}
								value={props.values.domain}
								name="email"
								placeholder="parklane-is.com"
							/>
						</FormControl>
						<Button type="submit">Submit</Button>
					</form>
				)}
			</Formik>
		</Container>
	)
}

export const getServerSideProps: GetServerSideProps<AdminProps> = async (
	context
) => {
	const sessionData = await getSessionData(context.req.cookies)
	if (!sessionData || sessionData.user.authLevel !== UserAuthLevel.Admin)
		return {
			redirect: {
				destination: "/403",
				permanent: false,
			},
		}

	const admins = await db.user.findMany({
		where: {
			authLevel: UserAuthLevel.Admin,
		},
	})
	const allowedDomains = await db.allowedDomain.findMany()
	return {
		props: {
			admins: admins.map((admin) => {
				return {
					id: admin.id,
					name: admin.name,
					email: admin.email,
					authLevel: admin.authLevel,
					reviewAmount: admin.reviewAmount,
				}
			}),
			allowedDomains: allowedDomains.map((domain) => domain.domain),
		},
	}
}
