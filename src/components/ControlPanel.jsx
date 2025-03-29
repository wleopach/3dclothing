import { VStack, Text, Flex, Box, useBreakpointValue } from "@chakra-ui/react";
import { MdAddCircle } from "react-icons/md";
import { FaClipboardList } from "react-icons/fa";
import { useSnapshot } from "valtio";
import { state } from "../store";
import { Outlet, useNavigate } from "react-router-dom";

function ControlPanel() {
    const snap = useSnapshot(state);
    const navigate = useNavigate();

    // Responsive adjustments
    const flexDirection = useBreakpointValue({ base: "column", md: "row" });
    const buttonWidth = useBreakpointValue({ base: "100%", md: "200px" });
    const spacing = useBreakpointValue({ base: 4, md: 6 });
    const iconSize = useBreakpointValue({ base: 30, md: 40 });

    const handleCreateOrder = () => {
        state.currentOrder= {};
        state.ClientData = {};
        state.cc = "";
        state.registered = true;
        state.cart = []
        navigate("/control-panel/client");
    };

    const handleViewOrders = () => {
        navigate("/control-panel/orders");
    };

    return (
        <Flex
            minH="100vh"
            align="center"
            justify="center"
            bg="black"
            p={4}
        >
            <VStack spacing={spacing} w="full" maxW="container.xl">
                <Text
                    color="white"
                    fontSize={["xl", "2xl"]}
                    textAlign="center"
                    mb={4}
                >
                    Selecciona una de las opciones
                </Text>
                <Flex
                    gap={[4, 6]}
                    flexDirection={flexDirection}
                    w="full"
                    justifyContent="center"
                >
                    <Box
                        as="button"
                        onClick={handleCreateOrder}
                        bg={snap.color}
                        p={[4, 8]}
                        borderRadius="xl"
                        boxShadow="2xl"
                        _hover={{
                            transform: 'translateY(-5px)',
                            boxShadow: '3xl',
                        }}
                        transition="all 0.2s"
                        textAlign="center"
                        width={buttonWidth}
                        mb={flexDirection === "column" ? 4 : 0}
                    >
                        <MdAddCircle
                            size={iconSize}
                            color="black"
                            style={{
                                marginBottom: "1rem",
                                margin: "0 auto"
                            }}
                        />
                        <Text
                            fontSize={["lg", "xl"]}
                            fontWeight="bold"
                            color="black"
                        >
                            Ingresar órden
                        </Text>
                    </Box>

                    <Box
                        as="button"
                        onClick={handleViewOrders}
                        bg={snap.color}
                        p={[4, 8]}
                        borderRadius="xl"
                        boxShadow="2xl"
                        _hover={{
                            transform: 'translateY(-5px)',
                            boxShadow: '3xl',
                        }}
                        transition="all 0.2s"
                        textAlign="center"
                        width={buttonWidth}
                    >
                        <FaClipboardList
                            size={iconSize}
                            color="black"
                            style={{
                                marginBottom: "1rem",
                                margin: "0 auto"
                            }}
                        />
                        <Text
                            fontSize={["lg", "xl"]}
                            fontWeight="bold"
                            color="black"
                        >
                            Ver órdenes
                        </Text>
                    </Box>
                </Flex>
            </VStack>
        </Flex>
    );
}

export default ControlPanel;