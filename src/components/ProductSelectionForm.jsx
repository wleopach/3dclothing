import {useState, useEffect} from "react";
import {Button, VStack, Box, Flex, Text} from "@chakra-ui/react";
import {Formik, Form, Field} from "formik";
import {useSnapshot} from "valtio";
import {state} from "../store";
import axiosInstance from "./../axiosConfig";
import { useNavigate } from 'react-router-dom';

const ProductSelectionForm = () => {
    const navigate = useNavigate();
    const snap = useSnapshot(state);
    const [prendas, setPrendas] = useState([]);
    const [selectedStocks, setSelectedStocks] = useState([]);
    const [selectedPrenda, setSelectedPrenda] = useState({});
    const [selectedDescriptions, setSelectedSDescriptions] = useState([]);
    const [selectedProductName, setSelectedProductName] = useState("");
    const [selectedStockDescription, setSelectedStockDescription] = useState("");
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const fetchPrendas = async () => {
            try {
                const response = await axiosInstance.get("/prendas");
                setPrendas(response.data);
                
                // Si hay datos en el estado global, inicializar los valores
                if (state.currentOrder.product_id) {
                    const product = response.data.find(p => p.id == state.currentOrder.product_id);
                    if (product) {
                        setSelectedStocks(product.stocks);
                        setSelectedSDescriptions(product.descriptions);
                        setSelectedProductName(product.name);
                        setSelectedPrenda(product);
                        
                        // Encontrar el índice del stock seleccionado
                        const stockIndex = product.stocks.findIndex(
                            stock => stock === state.currentOrder.stock
                        );
                        if (stockIndex !== -1) {
                            setSelectedStockDescription(product.descriptions[stockIndex]);
                        }
                    }
                }
                setIsInitialized(true);
            } catch (error) {
                console.error("Error fetching prendas:", error);
            }
        };

        fetchPrendas();
    }, []);

    // Valores iniciales del formulario basados en el estado global
    const getInitialValues = () => {
        if (!isInitialized) {
            return { productType: "", stock: "" };
        }

        const stockIndex = selectedStocks.findIndex(
            stock => stock === state.currentOrder.stock
        );

        return {
            productType: state.currentOrder.product_id || "",
            stock: stockIndex !== -1 ? stockIndex + '' : ""
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
                    w={["90%", "80%", "60%", "40%"]}  // Bigger width on small screens
                    bg="black"
                    p={[4, 6, 8]}  // Increase padding for small devices
                    borderRadius="lg"
                    boxShadow="2xl"
                >
                    <Formik
                        initialValues={getInitialValues()}
                        enableReinitialize
                        onSubmit={(values, {setSubmitting}) => {
                            if (!values.productType || !values.stock) {
                                console.warn("Product and stock must be selected!");
                                setSubmitting(false);
                                return;
                            }
                            state.currentOrder.product_id = values.productType;
                            state.pickColor = true;
                            state.currentOrder.prenda = selectedPrenda;
                            state.currentOrder.stock = selectedStocks[values.stock];
                            state.currentOrder.productName = selectedProductName;
                            state.currentOrder.fabricName = selectedDescriptions[values.stock];
                            //state.file_3d = `${values.productType}.glb`;
                            state.showProductForm = false;
                            setSubmitting(false);
                            navigate("/control-panel/current-order/color");
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
                                                setSelectedPrenda(product);
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
