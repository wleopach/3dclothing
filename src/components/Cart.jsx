import {Box, Text, Button, VStack} from "@chakra-ui/react";
import { useSnapshot } from "valtio";
import state from "../store";
import Nav from "./Nav"; // Ensure Nav is properly imported

const Cart = () => {
    const snap = useSnapshot(state);

    if (!snap.showCart) return null;

    return (
        <VStack>
            <Nav /> {/* Include Nav */}
            <Box p={4} borderWidth={1} borderRadius="lg" shadow="md" maxW="600px" mx="auto">

                <Text fontSize="xl" fontWeight="bold" mb={4}>Listado de productos</Text>

                {snap.cart.length === 0 ? (
                    <Text color="gray.500">Your cart is empty.</Text>
                ) : (
                    <Box as="ul" listStylePosition="inside" spacing={4}>
                        {snap.cart.map((item, index) => (
                            <Box as="li"
                                 key={index}
                                 p={2}
                                 borderWidth={1}
                                 borderRadius="lg"
                                 display="flex"
                                 justifyContent="space-between"
                                 alignItems="center"
                                 mb={2}
                            >
                                <Box>
                                    <Text fontWeight="semibold">Product ID: {item.product_id}</Text>
                                    <Text>Talla: {item.size}</Text>
                                    <Text>Cantidad: {item.quantity}</Text>
                                    <Text>Correo: {item.client_email}</Text>
                                    <Text>Sexo: {item.sex}</Text>
                                </Box>
                                <Button
                                    colorScheme="red"
                                    size="sm"
                                    onClick={() => state.cart.splice(index, 1)}
                                >
                                    Remove
                                </Button>
                            </Box>
                        ))}
                    </Box>
                )}
            </Box>
        </VStack>
    );
};

export default Cart;
