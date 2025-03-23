import {Button, VStack, Text, Flex } from "@chakra-ui/react";
import { useSnapshot } from "valtio";
import {state} from "../store";
import { useNavigate } from "react-router-dom";  // Import useNavigate
function ControlPanel() {
    const snap = useSnapshot(state);
    const navigate = useNavigate(); // Initialize navigation
    // Handlers for navigation
    const handleCreateOrder = () => {
        navigate("/client"); // Navigate to create order page
    };

    const handleViewOrders = () => {
        navigate("/orders"); // Navigate to view orders page
    };
    return (
        <Flex minH="100vh" align="center" justify="center" bg="black" p={4}>
            <VStack spacing={2}>
                <Text color="white">Selecciona una de las opciones</Text>
                <Button
                    bg={snap.color}
                    color="black !important"
                    colorScheme="yellow"
                    width="full"
                    onClick={handleCreateOrder} // Navigate on click
                >
                    Ingresar órden
                </Button>
                <Button
                    bg={snap.color}
                    color="black !important"
                    colorScheme="yellow"
                    width="full"
                    onClick={handleViewOrders} // Navigate on click
                >
                    Ver órdenes
                </Button>
            </VStack>
        </Flex>
    )
}

export default ControlPanel
