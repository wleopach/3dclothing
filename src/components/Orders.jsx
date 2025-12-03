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
import {IoArrowBackOutline, IoPrintOutline} from "react-icons/io5";
import {MdArrowLeft, MdArrowRight} from "react-icons/md"
import OrderDetailsDialog from "./OrderDetailsDialog";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
    modelo3, modelo15, modelo6, modelo17, modelo10, modelo5,
    modelo18, modelo8, modelo9, pantalon6, modelo20, pantalon11,
    modelo12, modelo1, modelo7, modelo19, modelo2, pantalon10,
    pantalon9, pantalon1, pantalon7, modelo16, modelo14, pantalon4,
    modelo13, pantalon8, pantalon2, modelo4, pantalon5, modelo11, pantalon3
} from "./chothing-model/collars/Collars";
import types from "./chothing-model/collars/TypeMap";

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

    const handleDownloadPDF = async (order) => {
        const doc = new jsPDF();

        const formatKey = (key) => {
            const fieldMappings = {
                'personName': 'Nombre de la persona',
                'personRole': 'Cargo de la persona'
            };

            return key
                .split('_')
                .map(word => {
                    if (fieldMappings[word]) {
                        return fieldMappings[word];
                    }
                    return word.charAt(0).toUpperCase() + word.slice(1);
                })
                .join(' ');
        };

        const isBlusa = (productName) => {
            if (!productName) return false;
            return productName.toLowerCase().includes('blusa');
        };

        const getFirstColorCodeFromModel = (modelData) => {
            if (!modelData || !modelData.colors) return '';
            const firstColor = Object.values(modelData.colors)[0];
            if (!firstColor) return '';
            return String(firstColor);
        };

        const parseRgbTupleString = (colorStr) => {
            if (!colorStr || typeof colorStr !== 'string') return null;
            const match = colorStr.match(/\((\d+),(\d+),(\d+)\)/);
            if (!match) return null;
            return [
                parseInt(match[1], 10),
                parseInt(match[2], 10),
                parseInt(match[3], 10)
            ];
        };

        const findSelectedModels = (details) => {
            const models = [];
            Object.entries(details || {}).forEach(([key, value]) => {
                if (key.endsWith('_modelo') && typeof value === 'object' && value !== null) {
                    const fieldName = key.replace('_modelo', '');
                    const formattedFieldName = formatKey(fieldName);

                    const imageData = details[`${fieldName}_imageData`];
                    const personName = details[`${fieldName}_personName`];
                    const personRole = details[`${fieldName}_personRole`];

                    const completeModelData = {
                        ...value,
                        imageData,
                        personName,
                        personRole
                    };

                    models.push({
                        fieldName: formattedFieldName,
                        modelData: completeModelData,
                        originalKey: key
                    });
                }
            });
            return models;
        };

        const findSelectedTypes = (details) => {
            const types = [];
            Object.entries(details || {}).forEach(([key, value]) => {
                if (!key.endsWith('_modelo') && typeof value !== 'object' && value !== null && value !== '') {
                    const formattedFieldName = formatKey(key);
                    types.push({
                        fieldName: formattedFieldName,
                        value,
                        originalKey: key
                    });
                }
            });
            return types;
        };

        const buildProductDetailsText = (product) => {
            if (!product.details) return { text: '', colors: [] };

            let details;
            try {
                details = JSON.parse(product.details);
            } catch (e) {
                console.error('Error parsing details', e);
                return { text: '', colors: [] };
            }

            const lines = [];
            const colors = [];
            const productName = product.prenda?.name || '';

            const selectedModels = findSelectedModels(details);
            const selectedTypes = findSelectedTypes(details);

            if (isBlusa(productName)) {
                if (selectedModels.length > 0) {
                    lines.push('Modelos Seleccionados:');
                    selectedModels.forEach((model) => {
                        const modelName = model.modelData.modelName || `Modelo ${
                            (model.modelData.modelIndex ?? 0) + 1
                        }`;
                        const colorCode = getFirstColorCodeFromModel(model.modelData);
                        const colorTuple = colorCode ? parseRgbTupleString(colorCode) : null;
                        
                        if (colorTuple) {
                            colors.push({ lineIndex: lines.length, color: colorTuple });
                        }
                        lines.push(`  • ${model.fieldName}: ${modelName}`);
                    });
                    lines.push('');
                }

                if (selectedTypes.length > 0) {
                    lines.push('Bolsillos:');
                    selectedTypes.forEach((type) => {
                        lines.push(`  • ${type.fieldName}: ${type.value}`);
                    });
                }

                return { text: lines.join('\n'), colors };
            }

            if (selectedModels.length > 0) {
                lines.push('Modelos Seleccionados:');
                selectedModels.forEach((model) => {
                    const modelName = model.modelData.modelName || `Modelo ${
                        (model.modelData.modelIndex ?? 0) + 1
                    }`;
                    const colorCode = getFirstColorCodeFromModel(model.modelData);
                    const colorTuple = colorCode ? parseRgbTupleString(colorCode) : null;
                    
                    if (colorTuple) {
                        colors.push({ lineIndex: lines.length, color: colorTuple });
                    }
                    lines.push(`  • ${model.fieldName}: ${modelName}`);
                });
                lines.push('');
            }

            lines.push('Pretina:');
            lines.push(
                `  • Pretina Caucho: ${
                    details['pretina_Pretina Caucho'] ?? 'N/A'
                }`
            );
            lines.push(
                `  • Pretina: ${
                    details['pretina_Pretina'] ?? 'N/A'
                }`
            );
            lines.push('');

            lines.push('Bolsillos:');
            const lateralMain = details['bolsillos_lateral_main'];
            const lateralSub = details['bolsillos_lateral_sub'];
            if (lateralMain || lateralSub) {
                lines.push(
                    `  • Tipo de Bolsillo Lateral: ${
                        lateralMain ? `${lateralMain}${lateralSub ? ' --> ' + lateralSub : ''}` : 'Ninguno'
                    }`
                );
            }

            const parcheTraseroMain = details['bolsillos_parche trasero_main'];
            const parcheTraseroSub = details['bolsillos_parche trasero_sub'];
            lines.push(
                `  • Parche trasero: ${
                    parcheTraseroMain
                        ? `${parcheTraseroMain}${parcheTraseroSub ? ' --> ' + parcheTraseroSub : ''}`
                        : 'Ninguno'
                }`
            );

            const parcheRodillaMain = details['bolsillos_parche rodilla_main'];
            const parcheRodillaSub = details['bolsillos_parche rodilla_sub'];
            lines.push(
                `  • Parche rodilla: ${
                    parcheRodillaMain
                        ? `${parcheRodillaMain}${parcheRodillaSub ? ' --> ' + parcheRodillaSub : ''}`
                        : 'Ninguno'
                }`
            );
            lines.push('');

            lines.push('Bota:');
            lines.push(
                `  • Tipo bota: ${
                    details['bota_Tipo bota'] ?? 'N/A'
                }`
            );
            lines.push(
                `  • Dimensiones Ancho: ${
                    details['bota_Dimensiones_Ancho'] ?? 'N/A'
                } cm`
            );
            lines.push(
                `  • Dimensiones Largo: ${
                    details['bota_Dimensiones_Largo'] ?? 'N/A'
                } cm`
            );

            return { text: lines.join('\n'), colors };
        };

        const getFirstModelImageData = (products) => {
            if (!products) return null;
            for (const product of products) {
                if (!product.details) continue;
                try {
                    const details = JSON.parse(product.details);
                    const models = findSelectedModels(details);
                    for (const model of models) {
                        if (model.modelData && model.modelData.imageData) {
                            return model.modelData.imageData;
                        }
                    }
                } catch (e) {
                    console.error("Error parsing details for imageData", e);
                }
            }
            return null;
        };

        const loadImage = (src) => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = "Anonymous";
                img.onload = () => resolve(img);
                img.onerror = (err) => reject(err);
                img.src = src;
            });
        };

        const modelos = [
            modelo3, modelo15, modelo6, modelo17, modelo10, modelo5,
            modelo18, modelo8, modelo9, pantalon6, modelo20, pantalon11,
            modelo12, modelo1, modelo7, modelo19, modelo2, pantalon10,
            pantalon9, pantalon1, pantalon7, modelo16, modelo14, pantalon4,
            modelo13, pantalon8, pantalon2, modelo4, pantalon5, modelo11, pantalon3
        ];

        const getRgbColorForSvg = (colorStr) => {
            if (!colorStr || typeof colorStr !== 'string') {
                return 'gray';
            }
            try {
                const rgbMatch = colorStr.match(/\((\d+),(\d+),(\d+)\)/);
                if (rgbMatch && rgbMatch.length === 4) {
                    const [_, r, g, b] = rgbMatch;
                    return `rgb(${r}, ${g}, ${b})`;
                }
                return 'gray';
            } catch (error) {
                return 'gray';
            }
        };

        const svgToDataURL = async (modelData) => {
            if (!modelData || modelData.modelIndex === undefined) return null;

            let modelosArray = modelos;
            if (modelData.modelType && types[modelData.modelType]) {
                modelosArray = types[modelData.modelType];
            }

            const modelo = modelosArray[modelData.modelIndex];
            if (!modelo) return null;

            const svgNS = "http://www.w3.org/2000/svg";
            const svg = document.createElementNS(svgNS, "svg");
            svg.setAttribute("xmlns", svgNS);
            svg.setAttribute("width", "1080");
            svg.setAttribute("height", "1200");
            svg.setAttribute("viewBox", "0 0 1080 1200");

            const renderSVGElement = (element, color = null) => {
                const fillColor = color ? getRgbColorForSvg(color) : "currentColor";

                if (element.d) {
                    const path = document.createElementNS(svgNS, "path");
                    path.setAttribute("fill", fillColor);
                    path.setAttribute("d", element.d);
                    if (element.transform) path.setAttribute("transform", element.transform);
                    return path;
                } else if (element.x !== undefined && element.y !== undefined && element.width !== undefined && element.height !== undefined) {
                    const rect = document.createElementNS(svgNS, "rect");
                    rect.setAttribute("fill", fillColor);
                    rect.setAttribute("x", element.x);
                    rect.setAttribute("y", element.y);
                    rect.setAttribute("width", element.width);
                    rect.setAttribute("height", element.height);
                    if (element.rx) rect.setAttribute("rx", element.rx);
                    if (element.ry) rect.setAttribute("ry", element.ry);
                    if (element.transform) rect.setAttribute("transform", element.transform);
                    return rect;
                } else if (element.cx !== undefined && element.cy !== undefined && element.r !== undefined) {
                    const circle = document.createElementNS(svgNS, "circle");
                    circle.setAttribute("fill", fillColor);
                    circle.setAttribute("cx", element.cx);
                    circle.setAttribute("cy", element.cy);
                    circle.setAttribute("r", element.r);
                    if (element.transform) circle.setAttribute("transform", element.transform);
                    return circle;
                } else if (element.points && !element.strokeWidth) {
                    const polygon = document.createElementNS(svgNS, "polygon");
                    polygon.setAttribute("fill", fillColor);
                    polygon.setAttribute("points", element.points);
                    if (element.transform) polygon.setAttribute("transform", element.transform);
                    return polygon;
                } else if (element.points && element.strokeWidth) {
                    const polyline = document.createElementNS(svgNS, "polyline");
                    polyline.setAttribute("fill", "none");
                    polyline.setAttribute("stroke", "#000000");
                    polyline.setAttribute("points", element.points);
                    polyline.setAttribute("stroke-width", element.strokeWidth || "2");
                    if (element.transform) polyline.setAttribute("transform", element.transform);
                    return polyline;
                } else if (element.x1 !== undefined) {
                    const line = document.createElementNS(svgNS, "line");
                    line.setAttribute("x1", element.x1);
                    line.setAttribute("y1", element.y1);
                    line.setAttribute("x2", element.x2);
                    line.setAttribute("y2", element.y2);
                    line.setAttribute("stroke", "#000000");
                    line.setAttribute("stroke-width", element.strokeWidth || "2");
                    if (element.transform) line.setAttribute("transform", element.transform);
                    return line;
                }
                return null;
            };

            if (modelo.fondo) {
                Object.entries(modelo.fondo).forEach(([key, fondoGroup]) => {
                    ['paths', 'polygons', 'polylines', 'lines'].forEach(type => {
                        if (fondoGroup[type]) {
                            fondoGroup[type].forEach(element => {
                                const el = renderSVGElement(element);
                                if (el) svg.appendChild(el);
                            });
                        }
                    });
                });
            }

            if (modelo.color && modelData.colors) {
                Object.entries(modelo.color).forEach(([colorId, colorGroup]) => {
                    const colorValue = modelData.colors[colorId];
                    const color = colorValue || '#FF0000';
                    
                    ['paths', 'polygons', 'polylines', 'lines', 'rects', 'circles'].forEach(type => {
                        if (colorGroup[type]) {
                            colorGroup[type].forEach(element => {
                                const el = renderSVGElement(element, color);
                                if (el) svg.appendChild(el);
                            });
                        }
                    });
                });
            }

            const svgString = new XMLSerializer().serializeToString(svg);
            const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);

            try {
                const img = await loadImage(url);
                const canvas = document.createElement('canvas');
                canvas.width = 1080;
                canvas.height = 1200;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                const dataURL = canvas.toDataURL('image/png');
                URL.revokeObjectURL(url);
                return dataURL;
            } catch (e) {
                console.error('Error converting SVG to image:', e);
                URL.revokeObjectURL(url);
                return null;
            }
        };

        // Title
        doc.setFontSize(18);
        doc.setTextColor(49, 130, 206); // Blue
        doc.text(`Orden #${order.id}`, 14, 20);

        // Client & Order Info
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`Cliente: ${order.client?.name || 'N/A'}`, 14, 30);
        doc.text(`Email: ${order.client?.email || 'N/A'}`, 14, 35);
        doc.text(`Vendedor: ${order.seller?.username || 'N/A'}`, 14, 40);
        doc.text(`Cortador: ${order.cortador?.name || 'N/A'}`, 14, 45);
        doc.text(`Fecha: ${formatDate(order.order_date)}`, 14, 50);

        // Products Table
        const tableColumn = ["Producto", "Talla", "Cantidad", "Sexo", "Tela", "Detalles"];
        const tableRows = [];
        const productColors = [];

        if (order.products) {
            order.products.forEach(product => {
                const { text: detailsStr, colors } = buildProductDetailsText(product);

                productColors.push(colors);

                const productData = [
                    product.prenda?.name || 'N/A',
                    product.size,
                    product.quantity,
                    product.sex,
                    product.tela?.code || 'N/A',
                    detailsStr
                ];
                tableRows.push(productData);
            });
        }

        autoTable(doc, {
            startY: 55,
            head: [tableColumn],
            body: tableRows,
            headStyles: { fillColor: [49, 130, 206] },
            styles: { overflow: 'linebreak', fontSize: 8 },
            didDrawCell: (data) => {
                if (data.section !== 'body' || data.column.index !== 5) return;
                
                const colorData = productColors[data.row.index];
                if (!colorData || colorData.length === 0) return;

                const size = 3;
                const cell = data.cell;
                const cellLines = data.cell.text;
                
                doc.setFontSize(8);
                
                colorData.forEach((item) => {
                    const { lineIndex, color } = item;
                    
                    if (lineIndex >= cellLines.length) return;
                    
                    const lineText = cellLines[lineIndex];
                    const textWidth = doc.getTextWidth(lineText);
                    
                    const lineHeight = cell.height / cellLines.length;
                    
                    const x = cell.x + 2 + textWidth + 2;
                    const y = cell.y + (lineIndex * lineHeight) + (lineHeight - size) / 2;
                    
                    const [r, g, b] = color;
                    doc.setFillColor(r, g, b);
                    doc.rect(x, y, size, size, 'F');
                });
            }
        });

        let finalY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY : 55;
        let currentX = 14;
        const maxWidth = 60;
        const maxHeight = 70;
        const spacing = 5;

        for (const product of order.products || []) {
            if (!product.details) continue;

            try {
                const details = JSON.parse(product.details);
                const selectedModels = findSelectedModels(details);

                for (const model of selectedModels) {
                    if (!model.modelData) continue;

                    const svgDataURL = await svgToDataURL(model.modelData);
                    if (svgDataURL) {
                        const img = await loadImage(svgDataURL);
                        let width = img.width;
                        let height = img.height;

                        const widthRatio = maxWidth / width;
                        const heightRatio = maxHeight / height;
                        const ratio = Math.min(widthRatio, heightRatio, 1);
                        width *= ratio;
                        height *= ratio;

                        if (currentX + width > 200) {
                            currentX = 14;
                            finalY += maxHeight + spacing;
                        }

                        doc.setFontSize(8);
                        doc.text(`${model.fieldName}`, currentX, finalY + 5);
                        doc.addImage(svgDataURL, 'PNG', currentX, finalY + 8, width, height);

                        currentX += width + spacing;
                    }

                    if (model.modelData.imageData) {
                        const imageData = model.modelData.imageData;
                        const baseUrl = axiosInstance.defaults.baseURL.replace(/\/$/, "");
                        const imageUrl = `${baseUrl}/images/${imageData.id}/?extension=${imageData.extension}`;
                        const img = await loadImage(imageUrl);

                        let width = img.width;
                        let height = img.height;

                        const widthRatio = maxWidth / width;
                        const heightRatio = maxHeight / height;
                        const ratio = Math.min(widthRatio, heightRatio, 1);
                        width *= ratio;
                        height *= ratio;

                        if (currentX + width > 200) {
                            currentX = 14;
                            finalY += maxHeight + spacing;
                        }

                        const ext = (imageData.extension || '').toLowerCase();
                        const format = ext === 'jpg' || ext === 'jpeg' ? 'JPEG' : 'PNG';

                        doc.text(`Foto - ${model.fieldName}`, currentX, finalY + maxHeight + spacing + 5);
                        doc.addImage(img, format, currentX, finalY + maxHeight + spacing + 8, width, height);

                        currentX += width + spacing;
                    }
                }
            } catch (e) {
                console.error("Error adding model images to PDF", e);
            }
        }

        doc.save(`orden_${order.id}.pdf`);
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
                                                <IconButton
                                                    aria-label="Descargar PDF"
                                                    variant="ghost"
                                                    colorScheme="whiteAlpha"
                                                    color="white"
                                                    size="sm"
                                                    onClick={() => handleDownloadPDF(order)}
                                                    _hover={{ bg: "whiteAlpha.300" }}
                                                >
                                                    <IoPrintOutline size={24} />
                                                </IconButton>
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