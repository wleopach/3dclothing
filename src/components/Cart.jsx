import { Box, Text, Button } from "@chakra-ui/react";
import { useSnapshot } from "valtio";
import axiosInstance from "../axiosConfig"; // Import axios instance
import state from "../store";
import Nav from "./Nav"; // Ensure Nav is properly imported
import CustomButton from "./CustomButton";
const Cart = () => {
    const snap = useSnapshot(state);

    if (!snap.showCart) return null;
    console.log("Client data",snap.clientData)

    const handleCheckout = async () => {
        if (snap.cart.length === 0) {
            console.error("No items in the cart to submit.");
            return;
        }

        try {
            const cart = snap.cart.map(order => ({
                ...order,
                client_celphone: snap.clientData.phone || '',
                client_name: snap.clientData.name|| '',
                description: snap.clientData.orderDetails || ''
            }));
            const response = await axiosInstance.post("/orders/",  cart);

            console.log("Order placed successfully:", response.data);

            // Clear the cart after successful submission
            state.cart = [];
        } catch (error) {
            console.error("Error submitting order:", error.response?.data || error.message);
        }
    };

    return (
        <>
            <Nav /> {/* Include Nav */}
            <Box p={4} borderWidth={1} borderRadius="lg" shadow="md" maxW="600px" mx="auto">
                <Text fontSize="xl" fontWeight="bold" mb={4}>Listado de productos</Text>

                {snap.cart.length === 0 ? (
                    <Text color="gray.500">Your cart is empty.</Text>
                ) : (
                    <>
                        <Box
                            as="ul"
                            listStylePosition="inside"
                            spacing={4}
                            maxHeight="300px"  // Set max height for scrolling
                            overflowY="auto"   // Enable vertical scrolling
                            p={2}
                        >
                            {snap.cart.map((item, index) => (
                                <Box
                                    as="li"
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

                        {/* Checkout Button */}
                        <CustomButton
                            type="filled"
                            title="Enviar Orden"
                            handleClick={handleCheckout()}
                            customeStyles="w-fit px-4 py-2.5 font-bold text-sm"
                        />
                    </>
                )}
            </Box>
        </>
    );
};

export default Cart;
