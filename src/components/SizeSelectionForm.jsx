import Nav from './Nav'
import { useState, useEffect } from "react";
import {Button, VStack, Box, Flex, Text, useBreakpointValue, Input} from "@chakra-ui/react";
import { Formik, Form, Field } from "formik";
import axiosInstance from "../axiosConfig";
import {state, addToCart} from "../store";
import { useSnapshot } from "valtio";
import { useNavigate } from 'react-router-dom';

const SizeSelectionForm = () => {
    const snap = useSnapshot(state);
    const navigate = useNavigate();
    const [tallasData, setTallasData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [sex, setSex] = useState(state.currentOrder.sex || "");
    const [quantity, setQuantity] = useState(state.currentOrder.quantity || "");
    const [tallasCache, setTallasCache] = useState({});
    const [isInitialized, setIsInitialized] = useState(false);

    // More aggressive responsive values for very small screens
    const fontSize = useBreakpointValue({ base: "xs", sm: "sm", md: "md" });
    const buttonSize = useBreakpointValue({ base: "xs", sm: "sm", md: "md" });
    const inputHeight = useBreakpointValue({ base: "36px", sm: "40px", md: "45px" });
    const inputFontSize = useBreakpointValue({ base: "14px", sm: "16px", md: "18px" });
    const spacing = useBreakpointValue({ base: 1, sm: 2, md: 3 });
    const formPadding = useBreakpointValue({ base: 2, sm: 3, md: 4 });
    const containerHeight = useBreakpointValue({ base: "auto", sm: "auto", md: "85vh" });

    // For iPhone SE and other very small screens
    const isSizeButtonsCompact = useBreakpointValue({ base: true, sm: false });

    const fetchTallas = async () => {
        if (!snap.currentOrder.product_id || !["Hombre", "Mujer"].includes(sex)) {
            setTallasData([]);
            return;
        }

        const cacheKey = `${sex}-${snap.currentOrder.product_id}`;

        if (tallasCache[cacheKey]) {
            setTallasData(tallasCache[cacheKey]);
            // Si hay una talla seleccionada en el estado, seleccionarla
            setIsInitialized(true);
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await axiosInstance.get(
                `/tallas/by_name/by_sex?name=${snap.currentOrder.product_id}&sex=${sex}`
            );
            const tallas = response.data[0]?.values || [];

            setTallasData(tallas);

            // Si hay una talla seleccionada en el estado, seleccionarla
            setTallasCache((prevCache) => ({
                ...prevCache,
                [cacheKey]: tallas,
            }));
        } catch (error) {
            console.error("Error fetching tallas:", error.response?.data || error.message);
            setError("Failed to fetch tallas.");
        } finally {
            setLoading(false);
            setIsInitialized(true);
        }
    };

    useEffect(() => {
        fetchTallas();
    }, [sex, snap.currentOrder.product_id]);

    // Valores iniciales del formulario basados en el estado global
    const getInitialValues = () => {
        if (!isInitialized) {
            return { sex: "", talla: "", quantity: "" };
        }

        return {
            sex: state.currentOrder.sex || "",
            talla: state.currentOrder.size || "",
            quantity: state.currentOrder.quantity || ""
        };
    };

    return (
        <>
            <Flex
                align="center"
                justify="center"
                bg="black"
                p={[2, 3, 4]}
                minH={{ base: "auto" }}
            >
                <Box
                    w={["95%", "90%", "70%", "50%"]}
                    bg="black"
                    p={formPadding}
                    borderRadius="lg"
                    boxShadow="2xl"
                    display="flex"
                    flexDirection="column"
                    maxH={containerHeight}
                >
                    <Formik
                        initialValues={getInitialValues()}
                        enableReinitialize
                        onSubmit={(values, { setSubmitting }) => {
                            state.currentOrder.size = values.talla;
                            state.currentOrder.quantity = values.quantity;
                            state.currentOrder.sex = values.sex;
                            addToCart();
                            setSubmitting(false);
                            navigate("/control-panel/current-order/cart");
                        }}
                    >
                        {({ values, setFieldValue, isSubmitting }) => (

                            <Form style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <VStack spacing={spacing} align="stretch">
                                    {/* Title */}
                                    <Text
                                        fontSize={fontSize}
                                        fontWeight="bold"
                                        color={snap.color}
                                        textAlign="center"
                                        mb={1}
                                        flexShrink={0}
                                    >
                                        Seleccionar talla
                                    </Text>
                                    {/* Sex Selection */}
                                    <Field
                                        as="select"
                                        name="sex"
                                        id="sex"
                                        onChange={(e) => {
                                            const selectedSex = e.target.value;
                                            setFieldValue("sex", selectedSex);
                                            setSex(selectedSex);
                                            setFieldValue("talla", "");
                                            setFieldValue("quantity", "");
                                        }}
                                        style={{
                                            width: "100%",
                                            height: inputHeight,
                                            fontSize: inputFontSize,
                                            padding: "8px",
                                            borderRadius: "8px"
                                        }}
                                    >
                                        <option value="">Seleccione sexo</option>
                                        <option value="Mujer">Mujer</option>
                                        <option value="Hombre">Hombre</option>
                                    </Field>

                                    {/* Display Available Sizes */}
                                    {/* Scrollable content area */}
                                    <Box
                                        overflowY="auto"
                                        flexGrow={1}
                                        mb={2}
                                    >
                                        {/* Display Available Sizes */}
                                        {loading ? (
                                            <Text color="white" textAlign="center" fontSize={fontSize}>Cargando tallas...</Text>
                                        ) : error ? (
                                            <Text color="red.500" textAlign="center" fontSize={fontSize}>{error}</Text>
                                        ) : tallasData.length === 0 && sex ? (
                                            <Text color="white" textAlign="center" fontSize={fontSize}>No hay tallas disponibles</Text>
                                        ) : (
                                            <Flex wrap="wrap" justify="center" gap={[1, 2]} mb={2}>
                                                {tallasData.map((talla, index) => (
                                                    <Button
                                                        key={index}
                                                        onClick={() => {
                                                            setFieldValue("talla", talla);
                                                        }}
                                                        size={buttonSize}
                                                        m={0.5}
                                                        minW={isSizeButtonsCompact ? "35px" : "40px"}
                                                        height={isSizeButtonsCompact ? "35px" : "40px"}
                                                        px={isSizeButtonsCompact ? 1 : 2}
                                                        bg={values.talla === talla ? snap.colorGreen : "transparent"}
                                                        color={values.talla === talla ? "white" : snap.color}
                                                        border="2px solid"
                                                        borderColor={values.talla === talla ? snap.colorGreen : snap.color}
                                                        _hover={{
                                                            bg: values.talla === talla ? snap.colorGreen : `${snap.color}20`,
                                                            borderColor: values.talla === talla ? snap.colorGreen : snap.color
                                                        }}
                                                        _active={{
                                                            bg: values.talla === talla ? snap.colorGreen : `${snap.color}30`,
                                                            borderColor: values.talla === talla ? snap.colorGreen : snap.color
                                                        }}
                                                        transition="all 0.2s"
                                                    >
                                                        {talla}
                                                    </Button>
                                                ))}
                                            </Flex>
                                        )}

                                        {/* Custom Size Input */}
                                        {sex && (
                                            <Box mb={3} px={1}>
                                                <Input
                                                    placeholder="O escribe tu talla aquí..."
                                                    value={values.talla}
                                                    onChange={(e) => setFieldValue("talla", e.target.value)}
                                                    color="white"
                                                    borderColor={snap.color}
                                                    _hover={{ borderColor: snap.colorGreen }}
                                                    _focus={{ borderColor: snap.colorGreen, boxShadow: "none" }}
                                                    size={buttonSize}
                                                    textAlign="center"
                                                    bg="transparent"
                                                    _placeholder={{ color: "gray.500" }}
                                                />
                                            </Box>
                                        )}

                                        {/* Display Selected Options */}
                                        <Box mb={2}>
                                            {sex && (
                                                <Text color="white" fontSize={fontSize} textAlign="center">
                                                    Sexo seleccionado: <strong>{sex}</strong>
                                                </Text>
                                            )}

                                            {values.talla && (
                                                <Text color="white" fontSize={fontSize} textAlign="center">
                                                    Talla seleccionada: <strong>{values.talla}</strong>
                                                </Text>
                                            )}
                                        </Box>

                                        {/* Quantity Field */}
                                        {values.talla && (
                                            <>
                                                <Field
                                                    as="input"
                                                    type="number"
                                                    name="quantity"
                                                    placeholder="Cantidad"
                                                    min="1"
                                                    value={values.quantity}
                                                    onChange={(e) => {
                                                        const qty = e.target.value;
                                                        setFieldValue("quantity", qty);
                                                        setQuantity(qty);
                                                    }}
                                                    style={{
                                                        width: "100%",
                                                        height: inputHeight,
                                                        fontSize: inputFontSize,
                                                        padding: "8px",
                                                        borderRadius: "8px",
                                                        marginBottom: "8px"
                                                    }}
                                                />

                                                {/* Display Selected Quantity */}
                                                {quantity && (
                                                    <Text color="white" fontSize={fontSize} textAlign="center" mb={2}>
                                                        Cantidad seleccionada: <strong>{quantity}</strong>
                                                    </Text>
                                                )}
                                            </>
                                        )}
                                    </Box>

                                    {/* Fixed Footer with Button - Always visible */}
                                    <Box
                                        mt="auto"
                                        pt={2}
                                        pb={2}
                                        position="sticky"
                                        bottom={0}
                                        bg="black"
                                        zIndex={1}
                                        flexShrink={0}
                                    >
                                        <Button
                                            type="submit"
                                            bg={snap.color}
                                            color="black"
                                            isLoading={isSubmitting}
                                            width="full"
                                            size={buttonSize}
                                            disabled={loading || !values.talla || !values.quantity}
                                            _hover={{ opacity: 0.9 }}
                                        >
                                            Añadir a la órden
                                        </Button>
                                    </Box>
                                </VStack>
                            </Form>

                        )}
                    </Formik>
                </Box>
            </Flex>
        </>

    );
};

export default SizeSelectionForm;
