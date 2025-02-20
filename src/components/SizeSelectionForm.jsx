import { useState, useEffect } from "react";
import { Button, VStack, Box, Flex, Text } from "@chakra-ui/react";
import { Formik, Form, Field } from "formik";
import axiosInstance from "../axiosConfig";
import state from "../store";
import { useSnapshot } from "valtio";

const SizeSelectionForm = () => {
    const snap = useSnapshot(state);
    const [tallasData, setTallasData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedTalla, setSelectedTalla] = useState(null);
    const [sex, setSex] = useState("");
    const [quantity, setQuantity] = useState(""); // Store quantity input
    const [tallasCache, setTallasCache] = useState({});

    const fetchTallas = async () => {
        if (!snap.currentOrder.product_id || !["Hombre", "Mujer"].includes(sex)) {
            setTallasData([]);
            return;
        }

        const cacheKey = `${sex}-${snap.currentOrder.product_id}`;

        if (tallasCache[cacheKey]) {
            setTallasData(tallasCache[cacheKey]);
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

            setTallasCache((prevCache) => ({
                ...prevCache,
                [cacheKey]: tallas,
            }));
        } catch (error) {
            console.error("Error fetching tallas:", error.response?.data || error.message);
            setError("Failed to fetch tallas.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTallas();
    }, [sex, snap.currentOrder.productType]);

    return (
        <Flex minH="100vh" align="center" justify="center" bg="black" p={[2, 4, 6]}>
            <Box w={["95%", "90%", "70%", "50%"]} bg="black" p={[3, 4, 6]} borderRadius="lg" boxShadow="2xl">
                <Formik
                    initialValues={{ sex: "", talla: "", quantity: "" }}
                    onSubmit={(values, { setSubmitting }) => {
                        console.log("Selected talla:", values.talla, "Quantity:", values.quantity);
                        state.currentOrder.size = values.talla;
                        state.currentOrder.quantity = values.quantity;
                        state.currentOrder.sex = values.sex;
                        state.cart = [...state.cart, { ...state.currentOrder }];
                        console.log("cart", state.cart);
                        setSubmitting(false);
                    }}
                >
                    {({ values, setFieldValue, isSubmitting }) => (
                        <Form>
                            <VStack spacing={4} align="stretch">
                                {/* Sex Selection */}
                                <Field
                                    as="select"
                                    name="sex"
                                    id="sex"
                                    onChange={(e) => {
                                        const selectedSex = e.target.value;
                                        setFieldValue("sex", selectedSex);
                                        setSex(selectedSex);
                                        setSelectedTalla(null);
                                        setFieldValue("talla", "");
                                        setFieldValue("quantity", "");
                                    }}
                                    style={{
                                        width: "100%", height: "50px", fontSize: "18px",
                                        padding: "10px", borderRadius: "8px"
                                    }}
                                >
                                    <option value="">Seleccione sexo</option>
                                    <option value="Mujer">Mujer</option>
                                    <option value="Hombre">Hombre</option>
                                </Field>

                                {/* Display Available Sizes */}
                                {loading ? (
                                    <Text color="white" textAlign="center">Cargando tallas...</Text>
                                ) : error ? (
                                    <Text color="red.500" textAlign="center">{error}</Text>
                                ) : tallasData.length === 0 && sex ? (
                                    <Text color="white" textAlign="center">No hay tallas disponibles</Text>
                                ) : (
                                    <Flex wrap="wrap" justify="center" gap={2}>
                                        {tallasData.map((talla, index) => (
                                            <Button
                                                key={index}
                                                onClick={() => {
                                                    setSelectedTalla(talla);
                                                    setFieldValue("talla", talla);
                                                }}
                                                colorScheme={selectedTalla === talla ? "blue" : "gray"}
                                                variant={selectedTalla === talla ? "solid" : "outline"}
                                            >
                                                {talla}
                                            </Button>
                                        ))}
                                    </Flex>
                                )}

                                {/* Display Selected Options */}
                                {sex && (
                                    <Text color="white" fontSize="lg" textAlign="center">
                                        Sexo seleccionado: <strong>{sex}</strong>
                                    </Text>
                                )}

                                {selectedTalla && (
                                    <Text color="white" fontSize="lg" textAlign="center">
                                        Talla seleccionada: <strong>{selectedTalla}</strong>
                                    </Text>
                                )}

                                {/* Quantity Field */}
                                {selectedTalla && (
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
                                                width: "100%", height: "50px", fontSize: "18px",
                                                padding: "10px", borderRadius: "8px"
                                            }}
                                        />

                                        {/* Display Selected Quantity */}
                                        {quantity && (
                                            <Text color="white" fontSize="lg" textAlign="center">
                                                Cantidad seleccionada: <strong>{quantity}</strong>
                                            </Text>
                                        )}
                                    </>
                                )}

                                {/* Confirm Button */}
                                <Button
                                    type="submit"
                                    bg={snap.color}
                                    color="black"
                                    isLoading={isSubmitting}
                                    width="full"
                                    _hover={{ bg: selectedTalla ? "blue.500" : "gray" }}
                                    _active={{ bg: selectedTalla ? "blue.600" : "gray" }}
                                    disabled={loading || !values.talla || !values.quantity}
                                >
                                    Añadir a la órden
                                </Button>
                            </VStack>
                        </Form>
                    )}
                </Formik>
            </Box>
        </Flex>
    );
};

export default SizeSelectionForm;
