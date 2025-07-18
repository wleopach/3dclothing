import {
    Badge,
    Box,
    Button,
    Center,
    Container,
    Flex,
    Grid,
    Heading,
    HStack,
    IconButton,
    Input,
    SimpleGrid,
    Spinner,
    Stack,
    Text,
    useBreakpointValue,
    VStack,
    Separator
} from "@chakra-ui/react";
import {Field, Form, Formik} from 'formik';
import {useCallback, useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import axiosInstance from "../axiosConfig";
import {IoArrowBackOutline} from "react-icons/io5";
import {MdArrowLeft, MdArrowRight} from "react-icons/md"
import OrderDetailsDialog from "./OrderDetailsDialog";

const PAGE_SIZE = 30;  // Constante para el tamaño de página

function Orders() {
    const [items, setItems] = useState([]);
    const [sellers, setSellers] = useState([]);
    const [pagination, setPagination] = useState({
        count: 0,
        next: null,
        previous: null,
        current: 1
    });
    const [isLoading, setIsLoading] = useState(false);

    const [currentProductIndex, setCurrentProductIndex] = useState({});

    const inputHeight = useBreakpointValue({ base: "36px", sm: "40px", md: "40px" });
    const inputFontSize = useBreakpointValue({ base: "14px", sm: "16px", md: "16px" });

    // Función para colores
    const getRgbColor = (colorStr) => {
        if (!colorStr || typeof colorStr !== "string") {
            return "gray"; // Default color if invalid
        }

        try {
            // Extract the numbers from the tuple string format "(251,251,251)"
            const rgbMatch = colorStr.match(/\((\d+),(\d+),(\d+)\)/);
            if (rgbMatch && rgbMatch.length === 4) {
                const [_, r, g, b] = rgbMatch;
                return `rgb(${r}, ${g}, ${b})`;
            } else {
                console.warn("Invalid color format:", colorStr);
                return "gray";
            }
        } catch (error) {
            console.error("Error parsing color:", error);
            return "gray";
        }
    };

    // Función para obtener los vendedores
    const fetchSellers = async () => {
        try {
            const response = await axiosInstance.get('/sellers');
            setSellers(response.data);
        } catch (error) {
            console.error('Error fetching sellers:', error);
        }
    };

    const fetchOrders = async (page = 1, filters = {}) => {
        setIsLoading(true);
        try {
            const formattedStartDate = filters.start_date ? new Date(filters.start_date).toISOString().split('T')[0] : undefined;
            const formattedEndDate = filters.end_date ? new Date(filters.end_date).toISOString().split('T')[0] : undefined;

            const response = await axiosInstance.get('/orders', {
                params: {
                    page,
                    page_size: PAGE_SIZE,
                    client_cc: filters.client_cc || undefined,
                    start_date: formattedStartDate,
                    end_date: formattedEndDate,
                    seller_id: filters.seller_id || undefined
                }
            });
            setItems(response.data.results);
            setPagination({
                count: response.data.count,
                next: response.data.next,
                previous: response.data.previous,
                current: page
            });

            // Inicializar el índice del producto actual para cada orden
            const initialProductIndex = {};
            response.data.results.forEach(order => {
                if (order.products && order.products.length > 0) {
                    initialProductIndex[order.id] = 0;
                }
            });
            setCurrentProductIndex(initialProductIndex);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                setItems([]);
                setPagination({
                    count: 0,
                    next: null,
                    previous: null,
                    current: 1
                });
            }
            console.error('Error fetching orders:', error);
            console.error('Error response:', error.response);
        } finally {
            setIsLoading(false);
        }
    };

    // Función para navegar al siguiente producto
    const nextProduct = (orderId) => {
        const order = items.find(item => item.id === orderId);
        if (order && order.products) {
            const currentIndex = currentProductIndex[orderId] || 0;
            if (currentIndex < order.products.length - 1) {
                setCurrentProductIndex(prev => ({
                    ...prev,
                    [orderId]: currentIndex + 1
                }));
            }
        }
    };

    // Función para navegar al producto anterior
    const prevProduct = (orderId) => {
        const currentIndex = currentProductIndex[orderId] || 0;
        if (currentIndex > 0) {
            setCurrentProductIndex(prev => ({
                ...prev,
                [orderId]: currentIndex - 1
            }));
        }
    };

    // Función para obtener el producto actual de una orden
    const getCurrentProduct = (order) => {
        if (!order.products || order.products.length === 0) return null;
        const currentIndex = currentProductIndex[order.id] || 0;
        return order.products[currentIndex];
    };

    // Función debounced para fetchOrders
    const debouncedFetchOrders = useCallback(
        (() => {
            return (page, filters) => {
                let timeoutId;
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
                timeoutId = setTimeout(() => {
                    fetchOrders(page, filters);
                }, 500); // 500ms de delay
            };
        })(),
    );

    const renderFilters = () => {
        const handleSubmit = (values, { setSubmitting }) => {
            debouncedFetchOrders(1, values);
            setSubmitting(false);
        };
        return (
            <Formik
                initialValues={{
                    client_cc: '',
                    start_date: '',
                    end_date: '',
                    seller_id: ''
                }}
                enableReinitialize={true}
                onSubmit={handleSubmit}
            >
                {({ values, handleSubmit, handleReset, isSubmitting, setFieldValue }) => {
                    // Efecto para observar cambios en los valores del formulario
                    useEffect(() => {
                        handleSubmit();
                    }, [values]);

                    return (
                        <Form>
                            <Box
                                mb={8}
                                p={6}
                                bg="gray.50"
                                borderRadius="lg"
                                boxShadow="md"
                                border="1px"
                                borderColor="gray.200"
                            >
                                <Stack spacing={4} direction={{ base: "column", md: "row" }} align="flex-end">
                                    <Box flex="1" width="100%">
                                        <Text mb={2} fontWeight="semibold" color="gray.700">Número de Documento del Cliente</Text>
                                        <Field
                                            as={Input}
                                            name="client_cc"
                                            placeholder="Ingrese CC del cliente"
                                            bg="gray.700"
                                            color="white"
                                            padding={2}
                                            borderColor="gray.300"
                                            _hover={{
                                                borderColor: "blue.400"
                                            }}
                                            _placeholder={{
                                                color: "gray.400"
                                            }}
                                        />
                                    </Box>

                                    <Box flex="1" width="100%">
                                        <Text mb={2} fontWeight="semibold" color="gray.700">
                                            Vendedor
                                        </Text>

                                        <Field as="select" name="seller_id" style={{
                                            width: "100%",
                                            height: inputHeight,
                                            fontSize: inputFontSize,
                                            padding: "8px",
                                        }}>
                                            <option value="" style={{ backgroundColor: "#374151", color: "white" }}>Seleccione un vendedor</option>
                                            {sellers.map((seller) => (
                                                <option value={seller.id} key={seller.id} style={{ backgroundColor: "#374151", color: "white" }}>{seller.username}</option>
                                            ))}
                                        </Field>
                                    </Box>

                                    <Box flex="1" width="100%">
                                        <Text mb={2} fontWeight="semibold" color="gray.700">Fecha Inicio</Text>
                                        <Field
                                            as={Input}
                                            name="start_date"
                                            type="date"
                                            bg="gray.700"
                                            color="white"
                                            padding={2}
                                            borderColor="gray.300"
                                            _hover={{
                                                borderColor: "blue.400"
                                            }}
                                        />
                                    </Box>

                                    <Box flex="1" width="100%">
                                        <Text mb={2} fontWeight="semibold" color="gray.700">Fecha Fin</Text>
                                        <Field
                                            as={Input}
                                            name="end_date"
                                            type="date"
                                            bg="gray.700"
                                            color="white"
                                            padding={2}
                                            borderColor="gray.300"
                                            _hover={{
                                                borderColor: "blue.400"
                                            }}
                                        />
                                    </Box>

                                    <HStack spacing={3} alignSelf="flex-end" pt={{ base: 2, md: 0 }}>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                handleReset();
                                                fetchOrders(1, {});
                                            }}
                                            size="md"
                                            colorScheme="gray"
                                            borderColor="gray.400"
                                            _hover={{
                                                bg: "gray.500"
                                            }}
                                        >
                                            Limpiar
                                        </Button>
                                    </HStack>
                                </Stack>
                            </Box>
                        </Form>
                    );
                }}
            </Formik>
        );
    };

    useEffect(() => {
        fetchOrders(1);
        fetchSellers();
    }, []);

    const handlePageChange = (newPage) => {
        fetchOrders(newPage);
    };

    const renderPagination = () => {
        const totalPages = Math.ceil(pagination.count / PAGE_SIZE);
        const currentPage = pagination.current;

        // Determinar qué números de página mostrar
        let pages = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            // Si hay 5 o menos páginas, mostrar todas
            pages = Array.from({ length: totalPages }, (_, i) => i + 1);
        } else {
            // Siempre incluir la primera página
            pages.push(1);

            // Calcular el rango de páginas alrededor de la página actual
            let start = Math.max(2, currentPage - 1);
            let end = Math.min(totalPages - 1, currentPage + 1);

            // Ajustar si estamos cerca del inicio o final
            if (currentPage <= 2) {
                end = 4;
            }
            if (currentPage >= totalPages - 1) {
                start = totalPages - 3;
            }

            // Añadir ellipsis si es necesario
            if (start > 2) {
                pages.push('...');
            }

            // Añadir páginas del medio
            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            // Añadir ellipsis final si es necesario
            if (end < totalPages - 1) {
                pages.push('...');
            }

            // Siempre incluir la última página
            if (totalPages > 1) {
                pages.push(totalPages);
            }
        }

        return (
            <Center>
                <HStack spacing={2}>
                    <Button
                        size="sm"
                        colorScheme="blue"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                    >
                        ←
                    </Button>

                    {pages.map((page, index) => (
                        page === '...' ? (
                            <Text key={`ellipsis-${index}`} color="gray.500">...</Text>
                        ) : (
                            <Button
                                key={page}
                                size="sm"
                                variant={currentPage === page ? "solid" : "outline"}
                                colorScheme="blue"
                                onClick={() => handlePageChange(page)}
                                isDisabled={currentPage === page}
                                bg={currentPage === page ? "blue.500" : "white"}
                                color={currentPage === page ? "white" : "blue.500"}
                                _hover={{
                                    bg: currentPage === page ? "blue.600" : "blue.50"
                                }}
                                fontWeight="bold"
                            >
                                {page}
                            </Button>
                        )
                    ))}

                    <Button
                        size="sm"
                        colorScheme="blue"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                    >
                        →
                    </Button>
                </HStack>
            </Center>
        );
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    //const snap = useSnapshot(state);
    return (
        <Box position="relative" minHeight="100vh">  {/* Contenedor principal con altura mínima */}
            <Container maxW="container.xl" p={8} pb="100px"> {/* Añadir padding bottom para el espacio del paginador */}
                <Flex mb={8} align="center">
                    <Link to="/control-panel">
                        <IconButton
                            variant="ghost"
                            colorScheme="blue"
                            aria-label="Regresar al panel de control"
                            mr={4}
                            size="lg"
                            bg="blue.50"
                        >
                            <IoArrowBackOutline size={24} color="black" />
                        </IconButton>
                    </Link>
                    <Heading
                        width="100%"
                        textAlign="center"
                        fontSize={{ base: "2xl", md: "3xl", lg: "3xl" }}
                        fontWeight="bold"
                        textTransform="uppercase"
                    >
                        Historial de Órdenes
                    </Heading>
                </Flex>

                <Box mb={8}>
                    {renderFilters()}
                </Box>

                {isLoading ? (
                    <Center py={10}>
                        <VStack spacing={4}>
                            <Spinner
                                thickness="4px"
                                speed="0.65s"
                                emptyColor="gray.200"
                                color="blue.500"
                                size="xl"
                            />
                            <Text color="gray.500">Cargando órdenes...</Text>
                        </VStack>
                    </Center>
                ) : items.length === 0 ? (
                    <Center py={10}>
                        <VStack spacing={4}>
                            <Box
                                p={4}
                                borderRadius="lg"
                                bg="gray.50"
                                textAlign="center"
                                borderWidth="1px"
                                borderColor="gray.200"
                            >
                                <Text fontSize="lg" color="gray.600">
                                    No se encontraron órdenes
                                </Text>
                                <Text fontSize="sm" color="gray.500" mt={2}>
                                    Intenta ajustar los filtros de búsqueda
                                </Text>
                            </Box>
                        </VStack>
                    </Center>
                ) : (
                    <SimpleGrid
                        columns={{ base: 1, md: 2, lg: 3 }}
                        spacing={10}
                    >
                        {items.map((order) => {
                            const currentProduct = getCurrentProduct(order);
                            const currentIndex = currentProductIndex[order.id] || 0;
                            const totalProducts = order.products ? order.products.length : 0;

                            if (!currentProduct) return null;

                            return (
                                <Box
                                    key={`${order.id}-${currentIndex}`}
                                    borderWidth="2px"
                                    borderRadius="xl"
                                    overflow="hidden"
                                    boxShadow="0 10px 25px rgba(0, 0, 0, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1)"
                                    bg="white"
                                    m={2}
                                    transition="all 0.3s ease"
                                    _hover={{
                                        transform: "translateY(-8px)",
                                        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2), 0 8px 20px rgba(0, 0, 0, 0.15)",
                                        borderColor: "blue.300"
                                    }}
                                    position="relative"
                                    _before={{
                                        content: '""',
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: "4px",
                                        background: "linear-gradient(90deg, #3182ce, #63b3ed, #3182ce)",
                                        zIndex: 1
                                    }}
                                >
                                    {/* Encabezado: Información general de la orden */}
                                    <Box 
                                        p={6} 
                                        bg="linear-gradient(135deg, #3182ce 0%, #2c5282 100%)" 
                                        color="white" 
                                        borderTopRadius="xl"
                                        position="relative"
                                        overflow="hidden"
                                        _before={{
                                            content: '""',
                                            position: "absolute",
                                            top: "-50%",
                                            right: "-50%",
                                            width: "200%",
                                            height: "200%",
                                            background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
                                            zIndex: 0
                                        }}
                                    >
                                        <Box position="relative" zIndex={1}>
                                            <Flex justify="space-between" align="center" mb={4}>
                                                <Heading size="lg" color="white" textShadow="0 2px 4px rgba(0,0,0,0.3)">
                                                    Orden #{order.id}
                                                </Heading>
                                            </Flex>
                                            <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={6}>
                                                <Box>
                                                    <Text fontWeight="bold" fontSize="sm" opacity={0.9} mb={1}>👤 Cliente</Text>
                                                    <Text fontWeight="semibold" fontSize="md">{order.client?.name}</Text>
                                                    <Text fontSize="xs" opacity={0.8}>{order.client?.email}</Text>
                                                </Box>
                                                <Box>
                                                    <Text fontWeight="bold" fontSize="sm" opacity={0.9} mb={1}>🛍️ Vendedor</Text>
                                                    <Text fontWeight="semibold" fontSize="md">{order.seller?.username}</Text>
                                                    <Text fontWeight="bold" fontSize="sm" opacity={0.9} mt={2} mb={1}>✂️ Cortador</Text>
                                                    <Text fontWeight="semibold" fontSize="md">{order.cortador?.name}</Text>
                                                </Box>
                                                <Box>
                                                    <Text fontWeight="bold" fontSize="sm" opacity={0.9} mb={1}>📅 Fecha</Text>
                                                    <Text fontWeight="semibold" fontSize="sm">{formatDate(order.order_date)}</Text>
                                                </Box>
                                            </Grid>
                                        </Box>
                                    </Box>
                                    <Separator />
                                    {/* Sección de productos */}
                                    <Box p={6} bg="gray.50">
                                        {/* Navegación de productos */}
                                        {totalProducts > 1 && (
                                            <Flex justify="space-between" align="center" mb={4} p={3} bg="white" borderRadius="lg" boxShadow="sm">
                                                <Text fontSize="sm" color="gray.600" fontWeight="medium">
                                                    📦 Producto {currentIndex + 1} de {totalProducts}
                                                </Text>
                                                <HStack spacing={2}>
                                                    <IconButton
                                                        size="sm"
                                                        variant="outline"
                                                        colorScheme="blue"
                                                        _hover={{ bg: "blue.50", transform: "scale(1.1)" }}
                                                        onClick={() => prevProduct(order.id)}
                                                        disabled={currentIndex === 0}
                                                        aria-label="Producto anterior"
                                                        transition="all 0.2s ease"
                                                    >
                                                        <MdArrowLeft />
                                                    </IconButton>
                                                    <IconButton
                                                        size="sm"
                                                        variant="outline"
                                                        colorScheme="blue"
                                                        _hover={{ bg: "blue.50", transform: "scale(1.1)" }}
                                                        onClick={() => nextProduct(order.id)}
                                                        disabled={currentIndex === totalProducts - 1}
                                                        aria-label="Siguiente producto"
                                                        transition="all 0.2s ease"
                                                    >
                                                        <MdArrowRight />
                                                    </IconButton>
                                                </HStack>
                                            </Flex>
                                        )}
                                        
                                        <Box bg="white" p={5} borderRadius="xl" boxShadow="0 4px 12px rgba(0,0,0,0.05)">
                                            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                                                <Box>
                                                    <Text fontWeight="bold" color="gray.700" fontSize="md" mb={3} display="flex" alignItems="center">
                                                        👕 Producto
                                                    </Text>
                                                    <Text color="gray.900" fontSize="lg" fontWeight="semibold" mb={3}>
                                                        {currentProduct.prenda?.name}
                                                    </Text>
                                                    <VStack spacing={2} align="stretch">
                                                        <Badge 
                                                            colorScheme="purple" 
                                                            fontSize="sm" 
                                                            py={2} 
                                                            px={3}
                                                            borderRadius="lg"
                                                            textAlign="center"
                                                            boxShadow="sm"
                                                        >
                                                            📏 Talla: {currentProduct.size}
                                                        </Badge>
                                                        <Badge 
                                                            colorScheme="green" 
                                                            fontSize="sm" 
                                                            py={2} 
                                                            px={3}
                                                            borderRadius="lg"
                                                            textAlign="center"
                                                            boxShadow="sm"
                                                        >
                                                            🔢 Cantidad: {currentProduct.quantity}
                                                        </Badge>
                                                        <Badge 
                                                            colorScheme="blue" 
                                                            fontSize="sm" 
                                                            py={2} 
                                                            px={3}
                                                            borderRadius="lg"
                                                            textAlign="center"
                                                            boxShadow="sm"
                                                        >
                                                            👤 Sexo: {currentProduct.sex}
                                                        </Badge>
                                                    </VStack>
                                                </Box>
                                                <Box>
                                                    <Text fontWeight="bold" color="gray.700" fontSize="md" mb={3} display="flex" alignItems="center">
                                                        🧵 Tela
                                                    </Text>
                                                    <Box p={4} bg="gray.50" borderRadius="lg" border="1px solid" borderColor="gray.200">
                                                        <Text color="gray.900" fontSize="md" fontWeight="semibold" mb={2}>
                                                            Código: {currentProduct.tela?.code}
                                                        </Text>
                                                        <Flex align="center" justify="space-between">
                                                            <Text color="gray.700" fontSize="sm" fontWeight="medium">Color:</Text>
                                                            <Box
                                                                width="30px"
                                                                height="30px"
                                                                borderRadius="full"
                                                                backgroundColor={getRgbColor(currentProduct.tela?.color)}
                                                                border="3px solid white"
                                                                boxShadow="0 2px 8px rgba(0,0,0,0.2)"
                                                                position="relative"
                                                                _after={{
                                                                    content: '""',
                                                                    position: "absolute",
                                                                    top: "-2px",
                                                                    left: "-2px",
                                                                    right: "-2px",
                                                                    bottom: "-2px",
                                                                    borderRadius: "full",
                                                                    background: "linear-gradient(45deg, transparent, rgba(255,255,255,0.3), transparent)",
                                                                    zIndex: -1
                                                                }}
                                                            />
                                                        </Flex>
                                                    </Box>
                                                </Box>
                                            </Grid>
                                        </Box>
                                        
                                        {/* Detalles del producto */}
                                        {currentProduct.details && (
                                            <Box mt={4} textAlign="center">
                                                <OrderDetailsDialog 
                                                    details={JSON.parse(currentProduct.details)} 
                                                    productName={currentProduct.prenda?.name}
                                                />
                                            </Box>
                                        )}
                                    </Box>
                                </Box>
                            );
                        })}
                    </SimpleGrid>
                )}
            </Container>

            {/* Paginador fijo en la parte inferior */}
            <Box
                position="fixed"
                bottom={0}
                left={0}
                right={0}
                bg="black"
                borderTop="1px"
                borderColor="gray.200"
                py={4}
                px={8}
                boxShadow="0 -2px 10px rgba(0,0,0,0.1)"
                zIndex={1000}
            >
                {renderPagination()}
            </Box>
        </Box>
    );
}

export default Orders;