import {
    Box,
    Container,
    SimpleGrid,
    Text,
    Badge,
    Heading,
    Flex,
    VStack,
    Button,
    HStack,
    Center,
    Input,
    Stack,
    Spinner,
    IconButton,
    Grid,
    useBreakpointValue
} from "@chakra-ui/react";
import { Formik, Form, Field } from 'formik';
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from "../axiosConfig";
import { IoArrowBackOutline } from "react-icons/io5";

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

    // Función debounced para fetchOrders
    const debouncedFetchOrders = useCallback(
        (() => {
            let timeoutId;
            return (page, filters) => {
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
                                    <Box flex="1">
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

                                    <Box flex="1">
                                        <Text mb={2} fontWeight="semibold" color="gray.700">
                                            Vendedor
                                        </Text>

                                        <Field as="select" name="seller_id" style={{
                                            width: "100%",
                                            height: inputHeight,
                                            fontSize: inputFontSize,
                                            padding: "8px",
                                            borderRadius: "8px"
                                        }}>
                                            <option value="">Seleccione un vendedor</option>
                                            {sellers.map((seller) => (
                                                <option value={seller.id} key={seller.id}>{seller.username}</option>
                                            ))}
                                        </Field>
                                    </Box>

                                    <Box flex="1">
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

                                    <Box flex="1">
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
                                            color="gray.700"
                                            _hover={{
                                                bg: "gray.100"
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
                        isDisabled={currentPage <= 1}
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
                        isDisabled={currentPage >= totalPages}
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

                {renderFilters()}

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
                        spacing={8}
                        px={2}
                    >
                        {items.map((order) => (
                            <Box
                                key={order.id}
                                borderWidth="1px"
                                borderRadius="lg"
                                overflow="hidden"
                                boxShadow="sm"
                                bg="white"
                                m={2}
                            >
                                <Box
                                    p={3}
                                    bg="blue.500"
                                    color="white"
                                >
                                    <Flex justify="space-between" align="center">
                                        <Heading size="md" color="white">Orden #{order.id}</Heading>
                                        <Badge
                                            colorScheme="whiteAlpha"
                                            color="white"
                                            bg="whiteAlpha.300"
                                        >
                                            {order.sex}
                                        </Badge>
                                    </Flex>
                                </Box>
                                <VStack spacing={2} p={3} align="stretch">
                                    <Grid templateColumns="repeat(2, 1fr)" gap={3}>
                                        <Box>
                                            <Text fontWeight="bold" color="gray.700" fontSize="sm">Cliente</Text>
                                            <Text color="gray.900">{order.client?.name}</Text>
                                            <Text fontSize="xs" color="gray.500">{order.client?.email}</Text>
                                        </Box>

                                        <Box>
                                            <Text fontWeight="bold" color="gray.700" fontSize="sm">Producto</Text>
                                            <Text color="gray.900">{order.prenda?.name}</Text>
                                            <Flex gap={2} mt={1}>
                                                <VStack spacing={2} p={3} align="stretch">
                                                    <Badge colorScheme="purple" fontSize="xs">Talla: {order.size}</Badge>
                                                    <Badge colorScheme="green" fontSize="xs">Cantidad: {order.quantity}</Badge>
                                                </VStack>

                                            </Flex>
                                        </Box>
                                    </Grid>

                                    <Grid templateColumns="repeat(2, 1fr)" gap={3}>
                                        <Box>
                                            <Text fontWeight="bold" color="gray.700" fontSize="sm">Tela</Text>
                                            <Text color="gray.900" fontSize="sm">Código: {order.tela?.code}</Text>
                                            <HStack spacing={2} p={3} align="stretch">
                                                <Text color="gray.900" fontSize="sm">Color: </Text>
                                                <Box
                                                    width="20px"
                                                    height="20px"
                                                    borderRadius="md"
                                                    backgroundColor={getRgbColor(order.tela?.color)}
                                                    margin="0 auto"
                                                    mt={1}
                                                    border="2px solid white"
                                                />
                                            </HStack>

                                        </Box>

                                        <Box>
                                            <Text fontWeight="bold" color="gray.700" fontSize="sm">Vendedor</Text>
                                            <Text color="gray.900">{order.seller?.username}</Text>
                                            <Text fontWeight="bold" color="gray.700" fontSize="sm" mt={1}>
                                                Fecha de Orden
                                            </Text>
                                            <Text fontSize="xs" color="gray.900">
                                                {formatDate(order.order_date)}
                                            </Text>
                                        </Box>
                                    </Grid>
                                </VStack>
                            </Box>
                        ))}
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