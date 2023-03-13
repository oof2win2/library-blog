import { UserAuthLevel } from "@/utils/types"
import {
	EditAdminUser,
	EditAllowedDomain,
	// EditBook,
} from "@/utils/validators/UserForms"
import {
	Heading,
	Table,
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
import { GetServerSideProps, InferGetServerSidePropsType } from "next"
import { useEffect, useRef, useState } from "react"
import { toFormikValidationSchema } from "zod-formik-adapter"
import { DeleteIcon } from "@chakra-ui/icons"
import { useUserStore } from "@/utils/zustand"
import { api } from "@/utils/api"
import { useRouter } from "next/router"

export default function Admin() {
	const toast = useToast()
	const user = useUserStore((state) => state.user)
	const router = useRouter()

	const getAdminsQuery = api.user.getAdmins.useQuery()
	const promoteAdminMutation = api.user.promoteAdmin.useMutation()
	const demoteAdminMutation = api.user.demoteAdmin.useMutation()
	const [adminToDemote, setAdminToDemote] = useState("")
	const demoteAdminCancelRef = useRef<HTMLButtonElement>(null)

	const getAllowedDomainsQuery = api.user.getAllowedDomains.useQuery()
	const addAllowedDomainMutation = api.user.addAllowedDomain.useMutation()
	const removeAllowedDomainMutation =
		api.user.removeAllowedDomain.useMutation()
	const [domainToRemove, setDomainToRemove] = useState("")
	const removeDomainCancelRef = useRef<HTMLButtonElement>(null)

	useEffect(() => {
		if (!user || user.authLevel !== UserAuthLevel.Admin) {
			router.push("/403")
		}
	}, [user])

	useEffect(() => {
		if (promoteAdminMutation.status === "success") {
			toast({
				title: "Admin promoted",
				status: "success",
			})
			getAdminsQuery.refetch()
		} else if (promoteAdminMutation.status === "error")
			toast({
				title: "Error promoting admin",
				status: "error",
				description: promoteAdminMutation.error?.message,
			})
	}, [promoteAdminMutation.status])
	useEffect(() => {
		if (demoteAdminMutation.status === "success") {
			toast({
				title: "Admin demoted",
				status: "success",
			})
			getAdminsQuery.refetch()
		} else if (demoteAdminMutation.status === "error")
			toast({
				title: "Error demoting admin",
				status: "error",
				description: demoteAdminMutation.error?.message,
			})
	}, [demoteAdminMutation.status])

	useEffect(() => {
		if (addAllowedDomainMutation.status === "success") {
			toast({
				title: "Domain added",
				status: "success",
			})
			getAllowedDomainsQuery.refetch()
		} else if (addAllowedDomainMutation.status === "error")
			toast({
				title: "Error adding domain",
				status: "error",
				description: addAllowedDomainMutation.error?.message,
			})
	}, [addAllowedDomainMutation.status])
	useEffect(() => {
		if (removeAllowedDomainMutation.status === "success") {
			toast({
				title: "Domain removed",
				status: "success",
			})
			getAllowedDomainsQuery.refetch()
		} else if (removeAllowedDomainMutation.status === "error")
			toast({
				title: "Error removing domain",
				status: "error",
				description: removeAllowedDomainMutation.error?.message,
			})
	}, [removeAllowedDomainMutation.status])

	return (
		<Container maxW="80ch">
			{/* admin remove dialog */}
			<AlertDialog
				isOpen={adminToDemote !== ""}
				leastDestructiveRef={demoteAdminCancelRef}
				onClose={() => setAdminToDemote("")}
			>
				<AlertDialogOverlay>
					<AlertDialogContent>
						<AlertDialogHeader fontSize="lg" fontWeight="bold">
							Demote Admin
						</AlertDialogHeader>

						<AlertDialogBody>
							Are you sure? You can&apos;t undo this action
							afterwards.
						</AlertDialogBody>

						<AlertDialogFooter>
							<Button
								ref={demoteAdminCancelRef}
								onClick={() => setAdminToDemote("")}
							>
								Cancel
							</Button>
							<Button
								colorScheme="red"
								onClick={() => {
									if (adminToDemote)
										demoteAdminMutation.mutate(
											adminToDemote
										)
									setAdminToDemote("")
								}}
								ml={3}
							>
								Delete
							</Button>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialogOverlay>
			</AlertDialog>

			{/* remove domain dialog */}
			<AlertDialog
				isOpen={domainToRemove !== ""}
				leastDestructiveRef={removeDomainCancelRef}
				onClose={() => setDomainToRemove("")}
			>
				<AlertDialogOverlay>
					<AlertDialogContent>
						<AlertDialogHeader fontSize="lg" fontWeight="bold">
							Remove domain
						</AlertDialogHeader>

						<AlertDialogBody>
							Are you sure? You can&apos;t undo this action
							afterwards.
						</AlertDialogBody>

						<AlertDialogFooter>
							<Button
								ref={demoteAdminCancelRef}
								onClick={() => setDomainToRemove("")}
							>
								Cancel
							</Button>
							<Button
								colorScheme="red"
								onClick={() => {
									if (domainToRemove)
										removeAllowedDomainMutation.mutate(
											domainToRemove
										)
									setDomainToRemove("")
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
							<Th>Name</Th>
							<Th>Email</Th>
						</Tr>
					</Thead>
					<Tbody>
						{getAdminsQuery.data?.map((admin) => (
							<Tr key={admin.id}>
								<Th>{admin.name}</Th>
								<Th>{admin.email}</Th>
								<Th>
									<IconButton
										onClick={() => {
											setAdminToDemote(admin.email)
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
				onSubmit={(values) => promoteAdminMutation.mutate(values.email)}
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
								name="email"
								placeholder="pupil@parklane-is.com"
							/>
							<FormErrorMessage>
								{props.errors.email}
							</FormErrorMessage>
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
						{getAllowedDomainsQuery.data?.map((domain) => (
							<Tr key={domain.id}>
								<Th>{domain.domain}</Th>
								<Th>
									<IconButton
										onClick={() => {
											setDomainToRemove(domain.domain)
										}}
										aria-label="Delete allowed domain"
									>
										<DeleteIcon />
									</IconButton>
								</Th>
							</Tr>
						))}
					</Tbody>
				</Table>
			</TableContainer>
			<Heading size="md">Add allowed domain</Heading>
			<Formik
				initialValues={{ domain: "" }}
				validationSchema={toFormikValidationSchema(EditAllowedDomain)}
				onSubmit={(values) =>
					addAllowedDomainMutation.mutate(values.domain)
				}
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
								onChange={props.handleChange}
								onBlur={props.handleBlur}
								name="domain"
								placeholder="parklane-is.com"
							/>
							<FormErrorMessage>
								{props.errors.domain}
							</FormErrorMessage>
						</FormControl>
						<Button type="submit">Submit</Button>
					</form>
				)}
			</Formik>
		</Container>
	)
}
