import Nav from './Nav'
import {useState, useEffect} from "react";
import {Button, VStack, Box, Flex, Text} from "@chakra-ui/react";
import {Formik, Form, Field} from "formik";
import {useSnapshot} from "valtio";
import state from "../store";
import axiosInstance from "./../axiosConfig";

const ProductSelectionForm = () => {
    const snap = useSnapshot(state);
    const [prendas, setPrendas] = useState([]);
    const [selectedStocks, setSelectedStocks] = useState([]);
    const [selectedDescriptions, setSelectedSDescriptions] = useState([]);

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
                            state.currentOrder.product_id = values.productType;
                            console.log("current_order", state.currentOrder);
                            state.pickColor = true;
                            state.stock = values.stock;
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
                                            const selectedProduct = e.target.value;
                                            setFieldValue("productType", selectedProduct);

                                            // Find selected product's stocks and update the options
                                            const product = prendas.find(p => p.id == selectedProduct);
                                            setSelectedStocks(product ? product.stocks : []);
                                            setSelectedSDescriptions(product ? product.descriptions : []);
                                            setFieldValue("stock", ""); // Reset stock selection
                                        }}
                                        style={{
                                            width: "100%",      // Full width
                                            height: "50px",     // Increase height
                                            fontSize: "18px",   // Bigger text
                                            padding: "10px",    // More padding inside
                                            borderRadius: "8px" // Rounded corners
                                        }}
                                    >
                                        <option value="">Seleccione una prenda</option>
                                        {prendas.map((prenda) => (
                                            <option key={prenda.id} value={prenda.id}>
                                                {prenda.name}
                                            </option>
                                        ))}
                                    </Field>

                                    {/* Stock Selection Dropdown (Depends on Product Type) */}
                                    <Field
                                        as="select"
                                        name="stock"
                                        id="stock"
                                        disabled={!values.productType}
                                        style={{
                                            width: "100%",
                                            height: "50px",
                                            fontSize: "18px",
                                            padding: "10px",
                                            borderRadius: "8px"
                                        }}
                                    >

                                        <option value="">Seleccione un stock</option>
                                        {selectedStocks.map((stock, index) => (
                                            <option key={index} value={stock}>
                                                {`${stock} - ${selectedDescriptions[index]}`} {/* Combine stock and description */}
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
