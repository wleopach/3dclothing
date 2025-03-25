import {Box, Text, Button, useBreakpointValue, VStack} from "@chakra-ui/react";
import { useSnapshot } from "valtio";
import axiosInstance from "../axiosConfig"; // Import axios instance
import {state, removeFromCart, checkout} from "../store";
import Nav from "./Nav"; // Ensure Nav is properly imported
import CustomButton from "./CustomButton";
import CurrentProduct  from "./CurrentProduct";
const Cart = () => {
    const snap = useSnapshot(state);

    console.log("Client data",snap.clientData)

    const handleCheckout = async () => {
        if (snap.cart.length === 0) {
            console.error("No items in the cart to submit.");
            return;
        }

        try {
            const cart = snap.cart.map(order => ({
                ...order,
                client_cc: snap.clientData.cc
            }));
            const response = await axiosInstance.post("/orders/",  cart);
            console.log("Order placed successfully:", response.data);
            state.justCheckedOut = true;
            // Clear the cart after successful submission
            checkout();
        } catch (error) {
            console.error("Error submitting order:", error.response?.data || error.message);
        }
    };
// Responsive breakpoints
    const containerMaxWidth = useBreakpointValue({ base: "90%", sm: "85%", md: "600px" });
    const listMaxHeight = useBreakpointValue({ base: "200px", sm:"250px", md: "300px" });
    const buttonSize = useBreakpointValue({ base: "sm", md: "md" });
    console.log("Client cart",snap.cart);
    return (
        <>
            <Nav />
            <Box
                p={{ base: 3, md: 4 }}
                borderWidth={1}
                borderRadius="lg"
                shadow="md"
                maxW={containerMaxWidth}
                mx="auto"
                bg="black"
            >
                <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" mb={4}>
                    Listado de productos
                </Text>

                {snap.cart.length === 0 ? (
                    <Text color="gray.500">Your cart is empty.</Text>
                ) : (
                    <VStack spacing={4} align="stretch">
                        <Box
                            as="ul"
                            listStyleType="none"
                            spacing={4}
                            maxHeight={listMaxHeight}
                            overflowY="auto"
                            p={2}
                        >
                            {snap.cart.map((item, index) => (
                                <Box
                                    as="li"
                                    key={index}
                                    p={3}
                                    borderWidth={1}
                                    borderRadius="lg"
                                    display="flex"
                                    flexDirection={{ base: "column", md: "row" }}
                                    justifyContent="space-between"
                                    alignItems={{ base: "stretch", md: "center" }}
                                    mb={2}
                                    gap={2}
                                >
                                    <CurrentProduct
                                        productName={item.productName}
                                        fabricName={item.fabricName}
                                        colorSelected={item.colorSelected}
                                        codeSelected={item.codeSelected}
                                        sex={item.sex}
                                        size={item.size}
                                        quantity={item.quantity}
                                    />
                                    <Button
                                        colorScheme="red"
                                        size={buttonSize}
                                        onClick={() => removeFromCart(index)}
                                        alignSelf={{ base: "flex-end", md: "center" }}
                                        color="#76040c"
                                    >
                                        Remover
                                    </Button>
                                </Box>
                            ))}
                        </Box>

                        <CustomButton
                            type="filled"
                            title="Enviar Orden"
                            handleClick={handleCheckout}
                            customeStyles="w-fit px-4 py-2.5 font-bold text-sm"
                        />
                    </VStack>
                )}
            </Box>
        </>
    );
};

export default Cart;
