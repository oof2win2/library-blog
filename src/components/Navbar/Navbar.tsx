import {
  Box,
  Button,
  ButtonGroup,
  Container,
  Flex,
  Heading,
  HStack,
  IconButton,
  useBreakpointValue,
  useColorMode,
  useColorModeValue,
  useMediaQuery,
} from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon, MoonIcon, SunIcon } from "@chakra-ui/icons";
import Link from "next/link";
import { useState } from "react";

type Page = {
  type: "page";
  title: string;
  href: string;
};

const pages: Page[] = [
  {
    type: "page",
    title: "Home",
    href: "/",
  },
  {
    type: "page",
    title: "Reviews",
    href: "/reviews",
  },
  {
    type: "page",
    title: "Sign Up",
    href: "/user/signup",
  },
  {
    type: "page",
    title: "Login",
    href: "/user/login",
  },
];

const Navbar = () => {
  const [isDesktop] = useMediaQuery("(min-width: 800px)", {
    ssr: true,
    fallback: true, // return false on the server, and re-evaluate on the client side
  });
  const [mobileIsOpen, setMobileIsOpen] = useState(false);
  const { colorMode, toggleColorMode } = useColorMode();
  const isDark = colorMode === "dark";
  return (
    <Flex alignItems="center" width="100%" padding="20px 10px 20px 10px">
      <Heading whiteSpace="nowrap" paddingLeft="4px" size="md">
        Bookaholic Blurbs
      </Heading>
      {/* desktop view */}
      <Flex
        display={["none", "none", "flex", "flex"]}
        marginLeft="auto"
        alignItems="center"
      >
        <Flex justify="space-between" flex="1">
          <ButtonGroup variant="ghost" spacing="8">
            {pages.map((page) => (
              <Button key={page.title}>
                <Link href={page.href}>{page.title}</Link>
              </Button>
            ))}
          </ButtonGroup>
          <IconButton
            aria-label="Toggle dark mode"
            size="lg"
            icon={isDark ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            as="a"
            variant="ghost"
          />
        </Flex>
      </Flex>

      {/* mobile closed navbar */}
      <Flex
        display={["flex", "flex", "none", "none"]}
        marginLeft="auto"
        flexDir="row"
        alignItems="center"
      >
        <IconButton
          aria-label="Open Menu"
          size="lg"
          icon={<HamburgerIcon />}
          onClick={() => setMobileIsOpen(true)}
          as="a"
          variant="ghost"
        />
        <IconButton
          aria-label="Toggle dark mode"
          size="lg"
          icon={isDark ? <MoonIcon /> : <SunIcon />}
          onClick={toggleColorMode}
          as="a"
          variant="ghost"
        />
      </Flex>

      {/* mobile open */}
      <Flex
        w="100vw"
        display={mobileIsOpen ? "flex" : "none"}
        padding="20px 10px 20px 10px"
        bgColor={useColorModeValue("white", "gray.800")}
        h="100vh"
        pos="fixed"
        top="0"
        left="0"
        zIndex={20}
        overflowY="auto"
        flexDir="column"
      >
        <Flex justify="flex-end">
          <IconButton
            mt={2}
            mr={2}
            aria-label="Close Menu"
            size="lg"
            icon={<CloseIcon />}
            onClick={() => setMobileIsOpen(false)}
            variant="ghost"
          />
        </Flex>
        <Flex flexDir="column" align="center">
          {pages.map((page) => {
            return (
              <Link href={page.href} key={page.href}>
                <Button
                  variant="ghost"
                  my={5}
                  onClick={() => setMobileIsOpen(false)}
                >
                  {page.title}
                </Button>
              </Link>
            );
          })}
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Navbar;
