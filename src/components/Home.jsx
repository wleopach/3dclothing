import {Avatar, Box, Container, Flex, IconButton, Image, Menu, Portal, Spacer} from "@chakra-ui/react";
import {FaUser} from "react-icons/fa";
import {useSnapshot} from "valtio";
import {state} from "../store";
import {Outlet, useNavigate} from "react-router-dom";
import logo from "../assets/images/logo.png";

function Home() {
    const snap = useSnapshot(state);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    return (
        <Box minH="100vh" bg="black">
            {/* Navbar */}
            <Flex
                as="nav"
                align="center"
                justify="space-between"
                wrap="wrap"
                padding={4}
                bg="gray.900"
                color="white"
                borderBottom="1px"
                borderColor="gray.700"
                boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.4)"
                position="sticky"
                top="0"
                zIndex="1000"
            >
                <Flex align="center">
                    <Image
                        src={logo}
                        alt="Logo"
                        h="40px"
                        bg="white"
                        cursor="pointer"
                        onClick={() => navigate('/control-panel')}
                        _hover={{ transform: 'scale(1.05)' }}
                        transition="transform 0.2s"
                    />
                </Flex>

                <Spacer />

                <Box>
                    <Menu.Root>
                        <Menu.Trigger asChild>
                            <IconButton
                                aria-label="User menu"
                                variant="solid"
                                bg="gray.700"
                                color="white"
                                size="md"
                                _hover={{
                                    bg: 'gray.600',
                                    transform: 'scale(1.05)'
                                }}
                                _active={{
                                    bg: 'gray.500'
                                }}
                                transition="all 0.2s"
                            >
                                <Avatar.Root>
                                    <Avatar.Fallback>
                                        <FaUser size={20} />
                                    </Avatar.Fallback>
                                </Avatar.Root>
                            </IconButton>
                        </Menu.Trigger>
                        <Portal>
                            <Menu.Positioner>
                                <Menu.Content
                                    bg="gray.800"
                                    borderColor="gray.600"
                                    boxShadow="xl"
                                >
                                    <Menu.Item
                                        value="logout"
                                        onClick={handleLogout}
                                        color="white"
                                        bg="gray.800"
                                        _hover={{
                                            bg: 'gray.700',
                                            color: snap.color
                                        }}
                                    >
                                        Cerrar Sesión
                                    </Menu.Item>
                                </Menu.Content>
                            </Menu.Positioner>
                        </Portal>
                    </Menu.Root>
                </Box>
            </Flex>

            {/* Contenido principal */}
            <Container maxW="container.xl" p={0}>
                <Outlet />
            </Container>
        </Box>
    );
}

export default Home;
