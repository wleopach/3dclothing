import Nav from './Nav'
import { useState, useEffect } from "react";
import {Button, VStack, Box, Flex, Text } from "@chakra-ui/react";
import { Formik, Form, } from "formik";
import axiosInstance from "../axiosConfig";
import state from "../store";
import { useSnapshot } from "valtio";



const ColorSelectionForm = () => {
    const snap = useSnapshot(state);
    const [colorsData, setColorsData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedColor, setSelectedColor] = useState(null);

    // Fetch colors based on selected stock
    useEffect(() => {
        const fetchColors = async () => {
            if (!snap.stock) return;

            setLoading(true);
            setError("");
            try {
                const response = await axiosInstance.get("/telas/by_stock/", {
                    params: { stock: snap.stock }
                });
                const telaData = response.data;
                console.log("telas",telaData);
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
                    setColorsData(uniqueOptions);
                }
            } catch (error) {
                setError("Failed to fetch colors.");
                console.error("Error fetching colors:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchColors();
    }, [snap.stock]);

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

    return (
        <>
            <Nav/>
            <Flex
                minH="100vh"
                align="center"
                justify="center"
                bg="black"
                p={[2, 4, 6]}
            >
                <Box
                    w={["95%", "90%", "70%", "50%"]}
                    bg="black"
                    p={[3, 4, 6]}
                    borderRadius="lg"
                    boxShadow="2xl"
                    maxH={["80vh", "85vh", "90vh"]}
                    display="flex"
                    flexDirection="column"
                >
                    <Formik
                        initialValues={{ color: "" }}
                        enableReinitialize
                        onSubmit={(values, { setSubmitting }) => {
                            console.log("Selected color code:", values.color);
                            state.currentOrder.tela_id = selectedColor.id;
                            console.log("Current order:", state.currentOrder);
                            state.pickColor = false;
                            state.pickSize = true;
                            setSubmitting(false);
                        }}
                    >
                        {({ values, setFieldValue, isSubmitting }) => (
                            <Form style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <VStack spacing={3} align="stretch" height="100%">
                                    {/* Fixed Header */}
                                    <Box flexShrink={0}>
                                        <Text fontSize="xl" fontWeight="bold" color={snap.color} textAlign="center" mb={2}>
                                            Seleccionar color
                                        </Text>

                                        {/* Display selected color information */}
                                        {selectedColor && (
                                            <Box textAlign="center" mb={3}>
                                                <Text color={snap.color}>
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
                                    <Text color="white" flexShrink={0}>Colores disponibles:</Text>
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
                                            <Text color="white" textAlign="center" py={4}>Cargando colores...</Text>
                                        ) : colorsData.length === 0 ? (
                                            <Text color="white" textAlign="center" py={4}>No hay colores disponibles</Text>
                                        ) : (
                                            <Flex
                                                wrap="wrap"
                                                justify="center"
                                                gap={2}
                                            >
                                                {colorsData.map((colorData, index) => (
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