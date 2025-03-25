import { VStack, Text, Flex, Box } from "@chakra-ui/react";
import { MdAddCircle } from "react-icons/md";
import { FaClipboardList } from "react-icons/fa";
import { useSnapshot } from "valtio";
import { state } from "../store";
import { Outlet, useNavigate } from "react-router-dom";

function ControlPanel() {
    const snap = useSnapshot(state);
    const navigate = useNavigate();

    const handleCreateOrder = () => {
        navigate("/control-panel/client");
    };

    const handleViewOrders = () => {
        navigate("/control-panel/orders");
    };

    return (
        <Flex minH="100vh" align="center" justify="center" bg="black" p={4}>
            <VStack spacing={6}>
                <Text color="white" fontSize="2xl" mb={4}>Selecciona una de las opciones</Text>
                <Flex gap={6}>
                    <Box
                        as="button"
                        onClick={handleCreateOrder}
                        bg={snap.color}
                        p={8}
                        borderRadius="xl"
                        boxShadow="2xl"
                        _hover={{
                            transform: 'translateY(-5px)',
                            boxShadow: '3xl',
                        }}
                        transition="all 0.2s"
                        textAlign="center"
                        width="200px"
                    >
                        <MdAddCircle size={40} color="black" style={{ marginBottom: "1rem", margin: "0 auto" }} />
                        <Text fontSize="xl" fontWeight="bold" color="black">
                            Ingresar órden
                        </Text>
                    </Box>

                    <Box
                        as="button"
                        onClick={handleViewOrders}
                        bg={snap.color}
                        p={8}
                        borderRadius="xl"
                        boxShadow="2xl"
                        _hover={{
                            transform: 'translateY(-5px)',
                            boxShadow: '3xl',
                        }}
                        transition="all 0.2s"
                        textAlign="center"
                        width="200px"
                    >
                        <FaClipboardList size={40} color="black" style={{ marginBottom: "1rem", margin: "0 auto" }} />
                        <Text fontSize="xl" fontWeight="bold" color="black">
                            Ver órdenes
                        </Text>
                    </Box>
                </Flex>
            </VStack>
        </Flex>
    )
}

export default ControlPanel
