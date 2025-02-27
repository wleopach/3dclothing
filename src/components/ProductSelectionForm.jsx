import Nav from './Nav'
import CurrentOrder  from "./CurrentOrder";
import {useState, useEffect} from "react";
import {Button, VStack, Box, Flex, Text} from "@chakra-ui/react";
import {Formik, Form, Field} from "formik";
import {useSnapshot} from "valtio";
import {state} from "../store";
import axiosInstance from "./../axiosConfig";

const ProductSelectionForm = () => {
    const snap = useSnapshot(state);
    const [prendas, setPrendas] = useState([]);
    const [selectedStocks, setSelectedStocks] = useState([]);
    const [selectedDescriptions, setSelectedSDescriptions] = useState([]);
    const [selectedProductName, setSelectedProductName] = useState("");
    const [selectedStockDescription, setSelectedStockDescription] = useState("");

    useEffect(() => {
        const fetchPrendas = async () => {
            try {
                const response = await axiosInstance.get("/prendas");
                setPrendas(response.data); // Assuming response.data is an array of { id, name, stocks }
                console.log("prendas", response.data);
            } catch (error) {
                console.error("Error fetching prendas:", error);
            }
        };

        fetchPrendas();
    }, []);

    return (
        <>
            <Nav/>
            <CurrentOrder/>
            <Flex
                minH="100vh"
                align="center"
                justify="center"
                bg="black"
                p={[2, 4, 6]}  // Adjust padding based on screen size
            >
                <Box
                    w={["90%", "80%", "60%", "40%"]}  // Bigger width on small screens
                    bg="black"
                    p={[4, 6, 8]}  // Increase padding for small devices
                    borderRadius="lg"
                    boxShadow="2xl"
                >
                    <Formik
                        initialValues={{productType: "", stock: ""}}
                        onSubmit={(values, {setSubmitting}) => {
                            if (!values.productType || !values.stock) {
                                console.warn("Product and stock must be selected!");
                                setSubmitting(false);
                                return;
                            }
                            console.log("Selection:", values);
                            console.log("descs", selectedDescriptions);
                            state.currentOrder.product_id = values.productType;
                            console.log("current_order", state.currentOrder);
                            state.pickColor = true;
                            state.stock = selectedStocks[values.stock];
                            state.productName = selectedProductName;
                            state.fabricName = selectedDescriptions[values.stock];
                            console.log("FABRIC", state.fabricName);
                            //state.file_3d = `${values.productType}.glb`;
                            state.showProductForm = false;
                            setSubmitting(false);
                        }}
                    >
                        {({values, setFieldValue, isSubmitting}) => (
                            <Form>
                                <VStack spacing={4} align="stretch">
                                    <Text fontSize="xl" fontWeight="bold" color={snap.color} textAlign="center">
                                        Seleccionar producto
                                    </Text>

                                    {/* Product Type Dropdown */}
                                    <Field
                                        as="select"
                                        name="productType"
                                        id="productType"
                                        onChange={(e) => {
                                            const selectedProductId = e.target.value;
                                            setFieldValue("productType", selectedProductId);

                                            const product = prendas.find(p => p.id == selectedProductId);

                                            if (product) {
                                                setSelectedStocks(product.stocks);
                                                setSelectedSDescriptions(product.descriptions);
                                                setSelectedProductName(product.name); // Store product name
                                            } else {
                                                setSelectedStocks([]);
                                                setSelectedSDescriptions([]);
                                                setSelectedProductName("");
                                            }

                                            setFieldValue("stock", ""); // Reset stock selection
                                            setSelectedStockDescription(""); // Reset description
                                        }}
                                    >
                                        <option value="">Seleccione una prenda</option>
                                        {prendas.map((prenda) => (
                                            <option key={prenda.id} value={prenda.id}>
                                                {prenda.name}
                                            </option>
                                        ))}
                                    </Field>

                                    <Field
                                        as="select"
                                        name="stock"
                                        id="stock"
                                        disabled={!values.productType}
                                        onChange={(e) => {
                                            const selectedStockValue = e.target.value;
                                            setFieldValue("stock", selectedStockValue);

                                            const index = selectedStocks.indexOf(selectedStockValue);
                                            if (index !== -1) {
                                                setSelectedStockDescription(selectedDescriptions[index]); // Store stock description
                                            } else {
                                                setSelectedStockDescription("");
                                            }
                                        }}
                                    >
                                        <option value="">Seleccione un stock</option>
                                        {selectedStocks.map((stock, index) => (
                                            <option key={index} value={index}>
                                                {`${stock} - ${selectedDescriptions[index]}`}
                                            </option>
                                        ))}
                                    </Field>


                                    {/* Submit Button */}

                                <Button
                                    type="submit"
                                    bg={snap.color}
                                    color="black"
                                    isLoading={isSubmitting}
                                    width="full"
                                    _hover={{ bg: "yellow.500" }}
                                >
                                    Seleccionar Tela
                                </Button>

                                </VStack>
                            </Form>
                        )}
                    </Formik>
                </Box>
            </Flex>
        </>
    );
};

export default ProductSelectionForm;
