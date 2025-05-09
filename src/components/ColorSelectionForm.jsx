import { useState, useEffect } from "react";
import {Button, VStack, Box, Flex, Text, useBreakpointValue} from "@chakra-ui/react";
import { Formik, Form, } from "formik";
import axiosInstance from "../axiosConfig";
import {state} from "../store";
import { useSnapshot } from "valtio";
import { useNavigate } from 'react-router-dom';


const ColorSelectionForm = () => {
    const snap = useSnapshot(state);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedColor, setSelectedColor] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);

    // Responsive values
    const colorBoxSize = useBreakpointValue({ base: "30px", sm: "35px", md: "40px" });
    const fontSize = useBreakpointValue({ base: "xs", sm: "sm", md: "md" });
    const headerFontSize = useBreakpointValue({ base: "lg", sm: "xl", md: "2xl" });

    // Fetch colors based on selected stock
    useEffect(() => {
        const fetchColors = async () => {
            if (!snap.currentOrder.stock) return;

            setLoading(true);
            setError("");
            try {
                const response = await axiosInstance.get("/telas/by_stock/", {
                    params: { stock: snap.currentOrder.stock }
                });
                const telaData = response.data;
                if (Array.isArray(telaData)) {
                    // Keep the full tela object to maintain both color RGB and code
                    const colorOptions = telaData.map(tela => ({
                        color: tela.color, // RGB tuple like "(251,251,251)"
                        code: tela.code,    // Color code/name
                        id: tela.id  // id
                    }));
                    // Remove duplicates - this is more complex with objects
                    const uniqueOptions = colorOptions.filter((option, index, self) =>
                        index === self.findIndex((t) => t.code === option.code)
                    );
                    state.colorsData = uniqueOptions;

                    // Si hay un color seleccionado en el estado, buscarlo y seleccionarlo
                    if (state.currentOrder.tela_id) {
                        const savedColor = uniqueOptions.find(
                            color => color.id === state.currentOrder.tela_id
                        );
                        if (savedColor) {
                            setSelectedColor(savedColor);
                        }
                    }
                }
                setIsInitialized(true);
            } catch (error) {
                setError("Failed to fetch colors.");
                console.error("Error fetching colors:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchColors();
    }, [snap.currentOrder.stock]);

    // Convert RGB tuple string "(251,251,251)" to CSS color string
    const getRgbColor = (colorStr) => {
        if (!colorStr || typeof colorStr !== 'string') {
            return 'gray'; // Default color if invalid
        }

        try {
            // Extract the numbers from the tuple string format "(251,251,251)"
            const rgbMatch = colorStr.match(/\((\d+),(\d+),(\d+)\)/);
            if (rgbMatch && rgbMatch.length === 4) {
                const [_, r, g, b] = rgbMatch;
                return `rgb(${r}, ${g}, ${b})`;
            } else {
                // If the format doesn't match, return a default color
                console.warn("Invalid color format:", colorStr);
                return 'gray';
            }
        } catch (error) {
            console.error("Error parsing color:", error);
            return 'gray';
        }
    };

    const handleColorSelect = (colorData) => {
        setSelectedColor(colorData);
    };

    // Valores iniciales del formulario basados en el estado global
    const getInitialValues = () => {
        if (!isInitialized) {
            return { color: "" };
        }

        return {
            color: state.currentOrder.tela_id ? state.currentOrder.codeSelected : ""
        };
    };

    return (
        <>
            <Flex
                align="center"
                justify="center"
                bg="black"
            >
                <Box
                    w={["95%", "90%", "70%", "50%"]}
                    bg="black"
                    p={[2, 3, 4, 6]}
                    borderRadius="lg"
                    boxShadow="2xl"
                    maxH={["80vh", "85vh", "90vh"]}
                    display="flex"
                    flexDirection="column"
                >
                    <Formik
                        initialValues={getInitialValues()}
                        enableReinitialize
                        onSubmit={(values, { setSubmitting }) => {
                            state.currentOrder.tela_id = selectedColor.id;
                            state.pickColor = false;
                            state.pickSize = true;
                            state.currentOrder.codeSelected = selectedColor.code;
                            state.currentOrder.colorSelected = selectedColor.color;
                            setSubmitting(false);
                            navigate("/control-panel/current-order/details");
                        }}
                    >
                        {({ values, setFieldValue, isSubmitting }) => (
                            <Form style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <VStack spacing={3} align="stretch" height="100%">
                                    {/* Fixed Header */}
                                    <Box flexShrink={0}>
                                        <Text fontSize={headerFontSize} fontWeight="bold" color={snap.color} textAlign="center" mb={2}>
                                            Seleccionar color
                                        </Text>

                                        {/* Display selected color information */}
                                        {selectedColor && (
                                            <Box textAlign="center" mb={3}>
                                                <Text color={snap.color} fontSize={fontSize}>
                                                    Color seleccionado: {selectedColor.code}
                                                </Text>
                                                <Box
                                                    width="40px"
                                                    height="40px"
                                                    borderRadius="md"
                                                    backgroundColor={getRgbColor(selectedColor.color)}
                                                    margin="0 auto"
                                                    mt={1}
                                                    border="2px solid white"
                                                />
                                            </Box>
                                        )}
                                    </Box>

                                    {/* Scrollable Colors Container */}
                                    <Text color="white"  fontSize={fontSize}  flexShrink={0}>Colores disponibles:</Text>
                                    <Box
                                        overflowY="auto"
                                        flexGrow={1}
                                        maxH={["250px", "300px", "400px"]}
                                        mb={4}
                                        p={2}
                                        border="1px solid #333"
                                        borderRadius="md"
                                        sx={{
                                            // Ensure scrollbar is visible on all devices
                                            scrollbarWidth: "thin",
                                            scrollbarColor: "#666 #222",
                                            // Webkit browsers (Chrome, Safari)
                                            '&::-webkit-scrollbar': {
                                                width: '10px',
                                            },
                                            '&::-webkit-scrollbar-track': {
                                                background: '#222',
                                                borderRadius: '4px',
                                            },
                                            '&::-webkit-scrollbar-thumb': {
                                                background: '#666',
                                                borderRadius: '4px',
                                                border: '2px solid #222',
                                            },
                                            '&::-webkit-scrollbar-thumb:hover': {
                                                background: '#888',
                                            },
                                            // For iOS devices
                                            WebkitOverflowScrolling: 'touch',
                                        }}
                                    >
                                        {loading ? (
                                            <Text color="white" textAlign="center" py={2} fontSize={fontSize}>Cargando colores...</Text>
                                        ) : snap.colorsData.length === 0 ? (
                                            <Text color="white" textAlign="center" py={2} fontSize={fontSize}>No hay colores disponibles</Text>
                                        ) : (
                                            <Flex
                                                wrap="wrap"
                                                justify="center"
                                                gap={[1, 2]}
                                                px={[0, 1]}
                                            >
                                                {snap.colorsData.map((colorData, index) => (
                                                    <Box
                                                        key={index}
                                                        onClick={() => {
                                                            handleColorSelect(colorData);
                                                            setFieldValue("color", colorData.code);
                                                        }}
                                                        cursor="pointer"
                                                        borderRadius="md"
                                                        p={1}
                                                        mb={2}
                                                        border={selectedColor && selectedColor.code === colorData.code
                                                            ? "2px solid white"
                                                            : "2px solid transparent"}
                                                    >
                                                        <Box
                                                            width="40px"
                                                            height="40px"
                                                            borderRadius="md"
                                                            backgroundColor={getRgbColor(colorData.color)}
                                                            title={colorData.code}
                                                        />
                                                        <Text
                                                            color="white"
                                                            fontSize="xs"
                                                            textAlign="center"
                                                            mt={1}
                                                            isTruncated
                                                            maxW={colorBoxSize}
                                                        >
                                                            {colorData.code}
                                                        </Text>
                                                    </Box>
                                                ))}
                                            </Flex>
                                        )}
                                    </Box>

                                    {/* Fixed Footer */}
                                    <Box
                                        p={3}
                                        position="sticky"
                                        bottom="0"
                                        bg="black"
                                        display="flex"
                                        justifyContent="center"
                                        alignItems="center"
                                    >
                                        <Button
                                            type="submit"
                                            bg={snap.color}
                                            color="black"
                                            isLoading={isSubmitting}
                                            width="full"
                                            _hover={{ bg: selectedColor ? getRgbColor(selectedColor.color) : 'gray' }}
                                            _active={{ bg: selectedColor ? getRgbColor(selectedColor.color) : 'gray' }}
                                            disabled={loading || !values.color}
                                        >
                                            Confirmar selección
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

export default ColorSelectionForm;