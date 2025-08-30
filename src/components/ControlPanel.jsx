import { Box, Flex, Text, useBreakpointValue, VStack } from "@chakra-ui/react";
import { FaClipboardList } from "react-icons/fa";
import { MdAddCircle } from "react-icons/md";
import { MdEdit } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useSnapshot } from "valtio";
import { clearSavedState, getSavedState, hasSavedState, setDefaultState, state } from "../store";
import { useEffect, useState } from "react";
import ConfirmDialog from "./ui/confirm-dialog";

function ControlPanel() {
    const snap = useSnapshot(state);
    const navigate = useNavigate();
    const [hasDraftOrder, setHasDraftOrder] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    // Responsive adjustments
    const flexDirection = useBreakpointValue({ base: "column", md: "row" });
    const buttonWidth = useBreakpointValue({ base: "100%", md: "200px" });
    const spacing = useBreakpointValue({ base: 4, md: 6 });
    const iconSize = useBreakpointValue({ base: 30, md: 40 });

    // Verificar si hay una orden guardada como borrador
    useEffect(() => {
        const checkForDraftOrder = () => {
            try {
                setHasDraftOrder(showButtonSavedOrder());
            } catch (error) {
                setHasDraftOrder(false);
            }
        };

        checkForDraftOrder();
    }, []);

    function showButtonSavedOrder() {
        try {
            if (hasSavedState()) {
                const parsedState = getSavedState();
                // Verificar si hay datos de orden o carrito guardados
                const hasOrderData = parsedState.currentOrder &&
                    (parsedState.currentOrder.product_id ||
                        parsedState.currentOrder.client_email ||
                        parsedState.currentOrder.productName);
                const hasCartData = parsedState.cart && parsedState.cart.length > 0;
                const hasClientData = parsedState.clientData &&
                    Object.keys(parsedState.clientData).length > 0;

                return hasOrderData || hasCartData || hasClientData;
            }
        } catch (error) {
            return false;
        }
    }

    const handleCreateOrder = () => {
        if (hasDraftOrder) {
            setShowConfirmDialog(true);
        } else {
            // No hay orden guardada, proceder normalmente
            clearSavedState();
            state.currentOrder = {};
            state.clientData = {};
            state.cc = "";
            state.registered = true;
            state.cart = [];
            navigate("/control-panel/current-order/client");
        }
    };

    const handleConfirmCreateOrder = () => {
        setShowConfirmDialog(false);
        // Limpiar el estado y crear nueva orden
        clearSavedState();
        state.currentOrder = {};
        state.clientData = {};
        state.cc = "";
        state.registered = true;
        state.cart = [];
        navigate("/control-panel/current-order/client");
    };

    const handleCancelCreateOrder = () => {
        setShowConfirmDialog(false);
    };

    const handleViewOrders = () => {
        navigate("/control-panel/orders");
    };

    const handleContinueDraft = () => {
        // Cargar el estado guardado y navegar a la página correspondiente
        try {
            if (hasSavedState()) {
                const parsedState = getSavedState();

                // Determinar a qué página navegar basado en el progreso de la orden
                if (parsedState.currentOrder && parsedState.currentOrder.product_id) {
                    // Si ya hay un producto seleccionado, ir a la siguiente página
                    if (parsedState.currentOrder.colorSelected) {
                        console.log("parsedState.currentOrder.details", parsedState.currentOrder, parsedState.currentOrder.size);
                        if (!parsedState.currentOrder.details || Object.keys(parsedState.currentOrder.details).length === 0) {
                            navigate("/control-panel/current-order/details");
                        } else if (!parsedState.currentOrder.size) {
                            navigate("/control-panel/current-order/size");
                        } else {
                            navigate("/control-panel/current-order/cart");
                        }
                    } else {
                        navigate("/control-panel/current-order/color");
                    }
                } else if (parsedState.clientData && Object.keys(parsedState.clientData).length > 0) {
                    navigate("/control-panel/current-order/product");
                } else {
                    navigate("/control-panel/current-order/client");
                }
            }
        } catch (error) {
            console.error('Error al cargar orden guardada:', error);
            navigate("/control-panel/current-order/client");
        }
    };

    return (
        <Flex
            minH="90vh"
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
                    flexWrap="wrap"
                >
                    {hasDraftOrder && (
                        <Box
                            as="button"
                            onClick={handleContinueDraft}
                            bg="blue.500"
                            p={[4, 8]}
                            borderRadius="xl"
                            boxShadow="2xl"
                            _hover={{
                                transform: 'translateY(-5px)',
                                boxShadow: '3xl',
                                bg: 'blue.600'
                            }}
                            transition="all 0.2s"
                            textAlign="center"
                            width={buttonWidth}
                            mb={flexDirection === "column" ? 4 : 0}
                        >
                            <MdEdit
                                size={iconSize}
                                color="white"
                                style={{
                                    marginBottom: "1rem",
                                    margin: "0 auto"
                                }}
                            />
                            <Text
                                fontSize={["lg", "xl"]}
                                fontWeight="bold"
                                color="white"
                            >
                                Continuar editando orden
                            </Text>
                        </Box>
                    )}

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

            <ConfirmDialog
                isOpen={showConfirmDialog}
                onClose={handleCancelCreateOrder}
                onConfirm={handleConfirmCreateOrder}
                title="Orden guardada encontrada"
                message="Hay una orden guardada como borrador. Si continúa, se eliminará la orden actual. ¿Desea continuar?"
                confirmText="Continuar"
                cancelText="Cancelar"
                confirmColor="#e53e3e"
                cancelColor="#4a5568"
            />
        </Flex>
    );
}

export default ControlPanel;