import {Box, Text, Button, useBreakpointValue, VStack, Alert} from "@chakra-ui/react";
import { useSnapshot } from "valtio";
import axiosInstance from "../axiosConfig"; // Import axios instance
import {state, removeFromCart, checkout} from "../store";
import Nav from "./Nav"; // Ensure Nav is properly imported
import CustomButton from "./CustomButton";
import CurrentProduct  from "./CurrentProduct";
import { useState, useEffect } from "react";
import { Formik, Form, Field } from "formik";

const Cart = () => {
    const snap = useSnapshot(state);
    const [cortadores, setCortadores] = useState([]);
    const [selectedCortador, setSelectedCortador] = useState(null);
    const [showError, setShowError] = useState(false);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [showErrorAlert, setShowErrorAlert] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const fetchCortadores = async () => {
            try {
                const response = await axiosInstance.get("/cortadores");
                setCortadores(response.data);
            } catch (error) {
                console.error("Error fetching cortadores:", error);
            }
        };

        fetchCortadores();
    }, []);

    // Efecto para ocultar la alerta de éxito después de 3 segundos
    useEffect(() => {
        if (showSuccessAlert) {
            const timer = setTimeout(() => {
                setShowSuccessAlert(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showSuccessAlert]);

    // Efecto para ocultar la alerta de error después de 5 segundos
    useEffect(() => {
        if (showErrorAlert) {
            const timer = setTimeout(() => {
                setShowErrorAlert(false);
                setErrorMessage("");
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [showErrorAlert]);

    const handleCortadorChange = (cortadorId, setFieldValue) => {
        const cortador = cortadores.find(c => c.id == cortadorId);
        if (cortador) {
            setSelectedCortador(cortador);
            setShowError(false);
        }
    };

    const handleCheckout = async () => {
        if (snap.cart.length === 0) {
            return;
        }

        // Verificar que se haya seleccionado un cortador
        if (!selectedCortador) {
            setShowError(true);
            return;
        }

        try {
            const products = snap.cart.map(order => ({
                ...order
            }));

            const cart = {
                products: products,
                cortador_id: selectedCortador.id,
                cortadorName: selectedCortador.name,
                client_cc: snap.clientData.cc
            }

            const response = await axiosInstance.post("/orders/",  cart);
            console.log("Order placed successfully:", response.data);
            state.justCheckedOut = true;
            // Clear the cart after successful submission
            checkout();
            // Mostrar alerta de éxito
            setShowSuccessAlert(true);
            setShowErrorAlert(false);
            setErrorMessage("");
        } catch (error) {
            console.error("Error submitting order:", error.response?.data || error.message);
            // Mostrar alerta de error
            setShowErrorAlert(true);
            setErrorMessage(error.response?.data?.message || "Error al enviar la orden. Por favor, inténtelo de nuevo.");
            setShowSuccessAlert(false);
        }
    };

// Responsive breakpoints
    const containerMaxWidth = useBreakpointValue({ base: "90%", sm: "85%", md: "600px" });
    const listMaxHeight = useBreakpointValue({ base: "200px", sm:"250px", md: "90vh" });
    const buttonSize = useBreakpointValue({ base: "sm", md: "md" });

    // Valores iniciales para Formik
    const getInitialValues = () => {
        return {
            cortador: selectedCortador?.id || ""
        };
    };

    return (
        <>
            {/* Alertas flotantes con posicionamiento absoluto */}
            {showSuccessAlert && (
                <Box
                    position="fixed"
                    top="20px"
                    left="50%"
                    transform="translateX(-50%)"
                    zIndex="9999"
                    bg="green.500"
                    color="white"
                    px={6}
                    py={4}
                    borderRadius="lg"
                    boxShadow="lg"
                    maxW="400px"
                    textAlign="center"
                >
                    <Text fontWeight="bold" fontSize="md">
                        ✅ Orden enviada con éxito
                    </Text>
                </Box>
            )}

            {showErrorAlert && (
                <Box
                    position="fixed"
                    top="20px"
                    left="50%"
                    transform="translateX(-50%)"
                    zIndex="9999"
                    bg="red.500"
                    color="white"
                    px={6}
                    py={4}
                    borderRadius="lg"
                    boxShadow="lg"
                    maxW="400px"
                    textAlign="center"
                >
                    <Text fontWeight="bold" fontSize="md">
                        ❌ {errorMessage}
                    </Text>
                </Box>
            )}

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
                    <Text color="gray.500">No hay productos en el carrito.</Text>
                ) : (
                    <Formik
                        initialValues={getInitialValues()}
                        enableReinitialize
                        onSubmit={(values) => {
                            // La lógica de checkout se maneja en handleCheckout
                            handleCheckout();
                        }}
                    >
                        {({ values, setFieldValue }) => (
                            <Form>
                                <VStack spacing={4} align="stretch">
                                    {/* Selector de cortador global */}
                                    <Box>
                                        <Text fontSize="md" color="white" fontWeight="bold" mb={2}>
                                            Seleccionar cortador para todos los productos:
                                        </Text>
                                        <Field
                                            as="select"
                                            name="cortador"
                                            onChange={(e) => {
                                                const cortadorId = e.target.value;
                                                setFieldValue("cortador", cortadorId);
                                                handleCortadorChange(cortadorId, setFieldValue);
                                            }}
                                            style={{
                                                width: "100%",
                                                padding: "12px",
                                                borderRadius: "6px",
                                                backgroundColor: "white",
                                                color: "black",
                                                border: "1px solid #e2e8f0",
                                                fontSize: "16px"
                                            }}
                                        >
                                            <option value="">Seleccione un cortador</option>
                                            {cortadores.map((cortador) => (
                                                <option key={cortador.id} value={cortador.id}>
                                                    {cortador.name}
                                                </option>
                                            ))}
                                        </Field>
                                    </Box>

                                    {/* Mensaje de error */}
                                    {showError && (
                                        <Alert.Root status="error" borderRadius="md">
                                            <Text color="red.500" fontWeight="bold">
                                                ⚠️ Debe seleccionar un cortador para completar la orden.
                                            </Text>
                                        </Alert.Root>
                                    )}

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
                                                <VStack spacing={2} align="stretch" flex={1}>
                                                    <CurrentProduct
                                                        productName={item.productName}
                                                        cortadorName={item.cortadorName}
                                                        fabricName={item.fabricName}
                                                        colorSelected={item.colorSelected}
                                                        codeSelected={item.codeSelected}
                                                        sex={item.sex}
                                                        size={item.size}
                                                        quantity={item.quantity}
                                                    />
                                                </VStack>

                                                <Button
                                                    colorScheme="red"
                                                    size={buttonSize}
                                                    onClick={() => removeFromCart(index)}
                                                    alignSelf={{ base: "flex-end", md: "center" }}
                                                    color="white"
                                                    border="2px solid"
                                                    bg="#76040c"
                                                    px={2}
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
                            </Form>
                        )}
                    </Formik>
                )}
            </Box>
        </>
    );
};

export default Cart;
