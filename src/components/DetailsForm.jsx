import { Box, Button, Flex, Text, useBreakpointValue, VStack, ButtonGroup, SimpleGrid, Popover, Portal, Input } from "@chakra-ui/react";
import { Tooltip } from "@/components/ui/tooltip"
import { Form, Formik, Field } from "formik";
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useSnapshot } from "valtio";
import { state } from "../store";
import axiosInstance from "../axiosConfig";


const DetailsForm = () => {
    const snap = useSnapshot(state);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedColor, setSelectedColor] = useState(null);
    const [detailsData, setDetailsData] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [formValues, setFormValues] = useState({});

    // Cargar los valores guardados cuando el componente se monta
    useEffect(() => {
        if (state.currentOrder.details) {
            setFormValues(state.currentOrder.details);
        }
    }, []);

    // Función para capitalizar la primera letra
    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    // Responsive values
    const colorBoxSize = useBreakpointValue({ base: "30px", sm: "35px", md: "40px" });
    const fontSize = useBreakpointValue({ base: "xs", sm: "sm", md: "md" });
    const headerFontSize = useBreakpointValue({ base: "lg", sm: "xl", md: "2xl" });

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

    // Parse JSON string to array
    useEffect(() => {
        if (state.currentOrder.prenda.details) {
            try {
                let parsedDetails = JSON.parse(state.currentOrder.prenda.details);
                setDetailsData(parsedDetails);
            } catch (error) {
                console.error("Error parsing details JSON:", error);
            }
        }
    }, [state.currentOrder.prenda.details]);

    const isStepComplete = (stepIndex) => {
        const currentStepData = detailsData[stepIndex];
        if (!currentStepData || !currentStepData.campos) return false;

        return currentStepData.campos.every(campo => {
            // Skip validation if field is optional
            // if (campo.obligatorio === false) return true;

            const fieldName = `${currentStepData.nombre}_${campo.nombre}`;
            
            // Handle different field types
            if (campo.tipo === "escoger") {
                return formValues[fieldName] && formValues[fieldName].trim() !== '';
            }
            
            // console.log(formValues);
            if (campo.tipo === "escoger-multi-campo") {
                // Check if main option is selected
                const mainSelected = formValues[`${fieldName}_main`];
                if (!mainSelected) return false;

                // For each option in the multi-campo
                return campo.opciones.every(opcion => {
                    if (opcion.nombre === mainSelected) {
                        // If it's a simple escoger type
                        if (opcion.tipo === "escoger") {
                            return formValues[`${fieldName}_sub`] && formValues[`${fieldName}_sub`].trim() !== '';
                        }
                        // If it's a escoger-tipo with color
                        if (opcion.tipo === "escoger-tipo") {
                            // Check if any of the sub-options is a color type
                            const hasColorType = opcion.opciones.some(subObj => subObj.tipo === "color");
                            if (hasColorType) {
                                // Validate that all color fields are filled
                                return opcion.opciones.every(subObj => {
                                    if (subObj.tipo === "color") {
                                        const colorValue = formValues[`${fieldName}_${subObj.nombre}`];
                                        return colorValue !== undefined && colorValue !== null;
                                    }
                                    return true;
                                });
                            }
                        }
                    }
                    return true;
                });
            }

            if (campo.tipo === "input-number") {
                return campo.opciones.every(opcion => {
                    const value = formValues[`${fieldName}_${opcion}`];
                    return value !== undefined && value !== '';
                });
            }

            return true;
        });
    };

    const handleOptionSelect = (stepNombre, campoNombre, opcion) => {
        const newValues = { ...formValues };
        newValues[`${stepNombre}_${campoNombre}`] = opcion;
        setFormValues(newValues);
    };

    const handleClearSelection = (stepNombre, campoNombre) => {
        const newValues = { ...formValues };
        delete newValues[`${stepNombre}_${campoNombre}`];
        setFormValues(newValues);
    };

    const handleColorSelect = (colorData, stepNombre, campoNombre, subObjNombre) => {
        const newValues = { ...formValues };
        newValues[`${stepNombre}_${campoNombre}_${subObjNombre}`] = colorData;
        setFormValues(newValues);
    };

    const handleClearMultiCampoSelection = (stepNombre, campoNombre) => {
        const newValues = { ...formValues };
        // Remove all related fields
        Object.keys(newValues).forEach(key => {
            if (key.startsWith(`${stepNombre}_${campoNombre}`)) {
                delete newValues[key];
            }
        });
        setFormValues(newValues);
    };

    const handleNumberInputChange = (stepNombre, campoNombre, opcion, value) => {
        const newValues = { ...formValues };
        newValues[`${stepNombre}_${campoNombre}_${opcion}`] = value;
        setFormValues(newValues);
    };

    const NumberInput = ({ stepNombre, campoNombre, opcion }) => {
        const [localValue, setLocalValue] = useState(formValues[`${stepNombre}_${campoNombre}_${opcion}`] || '');

        const handleChange = (e) => {
            const value = e.target.value;
            setLocalValue(value);
        };

        const handleBlur = () => {
            handleNumberInputChange(stepNombre, campoNombre, opcion, localValue);
        };

        // Actualizar el valor local cuando cambia el valor en formValues
        useEffect(() => {
            const formValue = formValues[`${stepNombre}_${campoNombre}_${opcion}`];
            if (formValue !== undefined && formValue !== localValue) {
                setLocalValue(formValue);
            }
        }, [formValues[`${stepNombre}_${campoNombre}_${opcion}`]]);

        return (
            <Input
                name={`${stepNombre}_${campoNombre}_${opcion}`}
                placeholder={`Ingrese ${opcion.toLowerCase()}`}
                bg="gray.800"
                borderColor="gray.600"
                color="white"
                type="number"
                value={localValue}
                onChange={handleChange}
                onBlur={handleBlur}
                _hover={{
                    borderColor: snap.color
                }}
                _focus={{
                    borderColor: snap.color,
                    boxShadow: `0 0 0 1px ${snap.color}`
                }}
            />
        );
    };

    const renderClearButton = (stepNombre, campoNombre, isMultiCampo = false) => {
        const fieldName = isMultiCampo ? `${stepNombre}_${campoNombre}_main` : `${stepNombre}_${campoNombre}`;
        const handleClick = isMultiCampo 
            ? () => handleClearMultiCampoSelection(stepNombre, campoNombre)
            : () => handleClearSelection(stepNombre, campoNombre);

        return (
            <Tooltip
                content="Eliminar la selección actual"
                placement="top"
                hasArrow
                bg="red.500"
                color="white"
                openDelay={0}
                closeDelay={100}
            >
                <Button
                    size="sm"
                    bg="red.500"
                    color="white"
                    _hover={{
                        bg: "red.600"
                    }}
                    _active={{
                        bg: "red.700"
                    }}
                    px={1}
                    ml={2}
                    onClick={handleClick}
                >
                    Limpiar
                </Button>
            </Tooltip>
        );
    };

    const ColorSelector = ({ stepNombre, campoNombre, subObjNombre }) => {
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState("");
        const [selectedColorData, setSelectedColorData] = useState(null);

        // Efecto para inicializar el color seleccionado desde formValues
        useEffect(() => {
            const colorValue = formValues[`${stepNombre}_${campoNombre}_${subObjNombre}`];
            if (colorValue) {
                setSelectedColorData(colorValue);
            }
        }, [stepNombre, campoNombre, subObjNombre]);

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
                        const colorOptions = telaData.map(tela => ({
                            color: tela.color,
                            code: tela.code,
                            id: tela.id
                        }));
                        const uniqueOptions = colorOptions.filter((option, index, self) =>
                            index === self.findIndex((t) => t.code === option.code)
                        );
                        state.colorsData = uniqueOptions;
                    }
                } catch (error) {
                    setError("Failed to fetch colors.");
                    console.error("Error fetching colors:", error);
                } finally {
                    setLoading(false);
                }
            };

            fetchColors();
        }, [snap.currentOrder.stock]);

        const onColorSelect = (colorData) => {
            handleColorSelect(colorData, stepNombre, campoNombre, subObjNombre);
            setSelectedColorData(colorData);
        };

        return (
            <Box width="100%">
                {loading ? (
                    <Text color="white" textAlign="center" py={2} fontSize={fontSize}>Cargando colores...</Text>
                ) : snap.colorsData.length === 0 ? (
                    <Text color="white" textAlign="center" py={2} fontSize={fontSize}>No hay colores disponibles</Text>
                ) : (
                    <Popover.Root>
                        <Popover.Trigger asChild>
                            <Box
                                cursor="pointer"
                                borderRadius="md"
                                p={2}
                                border="2px solid"
                                borderColor={selectedColorData ? snap.color : "gray.600"}
                                bg={selectedColorData ? `${snap.color}20` : "transparent"}
                                _hover={{
                                    borderColor: snap.color,
                                    bg: `${snap.color}10`
                                }}
                                transition="all 0.2s"
                                display="flex"
                                alignItems="center"
                                gap={2}
                            >
                                {selectedColorData ? (
                                    <>
                                        <Box
                                            width="40px"
                                            height="40px"
                                            borderRadius="md"
                                            backgroundColor={getRgbColor(selectedColorData.color)}
                                        />
                                        <Text color="white" fontSize="sm">
                                            {selectedColorData.code}
                                        </Text>
                                    </>
                                ) : (
                                    <Text color="white" fontSize="sm">
                                        Seleccionar color
                                    </Text>
                                )}
                            </Box>
                        </Popover.Trigger>
                        <Portal>
                            <Popover.Positioner>
                                <Popover.Content width="400px">
                                    <Popover.Arrow />
                                    <Popover.Body>
                                        <Text color="white" fontWeight="bold" mb={3}>
                                            Seleccionar Color
                                        </Text>
                                        <Flex
                                            wrap="wrap"
                                            justify="start"
                                            gap={2}
                                            maxH="300px"
                                            overflowY="auto"
                                        >
                                            {snap.colorsData.map((colorData, index) => {
                                                const isSelected = selectedColorData?.code === colorData.code;
                                                return (
                                                    <Box
                                                        key={index}
                                                        onClick={() => onColorSelect(colorData)}
                                                        cursor="pointer"
                                                        borderRadius="md"
                                                        p={1}
                                                        border={isSelected ? "2px solid white" : "2px solid transparent"}
                                                        _hover={{
                                                            borderColor: snap.color,
                                                            bg: `${snap.color}10`
                                                        }}
                                                        transition="all 0.2s"
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
                                                            maxW="40px"
                                                        >
                                                            {colorData.code}
                                                        </Text>
                                                    </Box>
                                                );
                                            })}
                                        </Flex>
                                    </Popover.Body>
                                </Popover.Content>
                            </Popover.Positioner>
                        </Portal>
                    </Popover.Root>
                )}
            </Box>
        );
    };

    const CustomStepper = () => {
        return (
            <Box width="100%">
                {/* Steps Header */}
                <Flex
                    justify="space-between"
                    align="center"
                    mb={6}
                    position="relative"
                >
                    {detailsData.map((step, index) => {
                        const isActive = index === currentStep;
                        const isCompleted = index < currentStep;

                        return (
                            <Flex
                                key={index}
                                direction="column"
                                align="center"
                                flex={1}
                                position="relative"
                            >
                                {/* Step Circle */}
                                <Box
                                    w="40px"
                                    h="40px"
                                    borderRadius="full"
                                    bg={isActive ? snap.color : isCompleted ? `${snap.color}80` : "gray.600"}
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    mb={2}
                                    position="relative"
                                    zIndex={2}
                                >
                                    <Text
                                        color={isActive || isCompleted ? "black" : "white"}
                                        fontWeight="bold"
                                    >
                                        {index + 1}
                                    </Text>
                                </Box>

                                {/* Step Title */}
                                <Text
                                    color={isActive ? snap.color : isCompleted ? `${snap.color}80` : "gray.400"}
                                    fontSize="sm"
                                    fontWeight={isActive ? "bold" : "normal"}
                                    textAlign="center"
                                >
                                    {capitalizeFirstLetter(step.nombre)}
                                </Text>

                                {/* Connector Line */}
                                {index < detailsData.length - 1 && (
                                    <Box
                                        position="absolute"
                                        top="20px"
                                        right="-50%"
                                        width="100%"
                                        height="2px"
                                        bg={isCompleted ? snap.color : "gray.600"}
                                        zIndex={1}
                                    />
                                )}
                            </Flex>
                        );
                    })}
                </Flex>

                {/* Step Content */}
                <Box>
                    {detailsData.map((step, index) => (
                        <Box
                            key={index}
                            display={index === currentStep ? "block" : "none"}
                        >
                            <VStack spacing={4} align="stretch" p={4}>
                                {step.campos && step.campos.map((campo, campoIndex) => (
                                    <Box key={campoIndex}>
                                        <Text color={snap.color} mb={2}>
                                            {capitalizeFirstLetter(campo.nombre)}
                                            {campo.obligatorio === false && formValues[`${step.nombre}_${campo.nombre}`] && 
                                                renderClearButton(step.nombre, campo.nombre)
                                            }
                                            {campo.obligatorio === false && formValues[`${step.nombre}_${campo.nombre}_main`] && 
                                                renderClearButton(step.nombre, campo.nombre, true)
                                            }
                                        </Text>

                                        {campo.tipo === "escoger" && campo.opciones && campo.opciones.length > 0 && (
                                            <Box width="100%" display="flex" justifyContent="center">
                                                <SimpleGrid
                                                    columns={campo.opciones.length < 4 ? campo.opciones.length : 4}
                                                    spacing={4}
                                                    display="inline-grid"
                                                >
                                                    {campo.opciones.map((opcion, opcionIndex) => {
                                                        const isSelected = formValues[`${step.nombre}_${campo.nombre}`] === opcion;
                                                        return (
                                                            <Box
                                                                key={opcionIndex}
                                                                p={4}
                                                                borderRadius="md"
                                                                border="2px solid"
                                                                borderColor={isSelected ? snap.color : "gray.600"}
                                                                bg={isSelected ? `${snap.color}20` : "transparent"}
                                                                cursor="pointer"
                                                                onClick={() => handleOptionSelect(step.nombre, campo.nombre, opcion)}
                                                                _hover={{
                                                                    borderColor: snap.color,
                                                                    bg: `${snap.color}10`
                                                                }}
                                                                transition="all 0.2s"
                                                                margin="5px"
                                                                width="160px"
                                                                height="100px"
                                                                display="flex"
                                                                alignItems="center"
                                                                justifyContent="center"
                                                            >
                                                                <Text
                                                                    color={isSelected ? snap.color : "gray.400"}
                                                                    textAlign="center"
                                                                    fontWeight={isSelected ? "bold" : "normal"}
                                                                    width="100%"
                                                                >
                                                                    {capitalizeFirstLetter(opcion)}
                                                                </Text>
                                                            </Box>
                                                        );
                                                    })}
                                                </SimpleGrid>
                                            </Box>
                                        )}

                                        {campo.tipo === "escoger-multi-campo" && campo.opciones && campo.opciones.length > 0 && (
                                            <Box width="100%" display="flex" justifyContent="center">
                                                <SimpleGrid
                                                    columns={campo.opciones.length < 4 ? campo.opciones.length : 4}
                                                    spacing={4}
                                                    display="inline-grid"
                                                >
                                                    {campo.opciones.map((opcionObj, opcionObjIndex) => {
                                                        const mainSelected = formValues[`${step.nombre}_${campo.nombre}_main`] === opcionObj.nombre;
                                                        return (
                                                            <Box key={opcionObjIndex} width="100%">
                                                                <Box
                                                                    p={4}
                                                                    borderRadius="md"
                                                                    border="2px solid"
                                                                    borderColor={mainSelected ? snap.color : "gray.600"}
                                                                    bg={mainSelected ? `${snap.color}20` : "transparent"}
                                                                    cursor="pointer"
                                                                    onClick={() => {
                                                                        setFormValues({
                                                                            ...formValues,
                                                                            [`${step.nombre}_${campo.nombre}_main`]: opcionObj.nombre,
                                                                            [`${step.nombre}_${campo.nombre}_sub`]: ""
                                                                        });
                                                                    }}
                                                                    _hover={{
                                                                        borderColor: snap.color,
                                                                        bg: `${snap.color}10`
                                                                    }}
                                                                    transition="all 0.2s"
                                                                    margin="5px"
                                                                    width="160px"
                                                                    height="100px"
                                                                    display="flex"
                                                                    alignItems="center"
                                                                    justifyContent="center"
                                                                >
                                                                    <Text
                                                                        color={mainSelected ? snap.color : "gray.400"}
                                                                        textAlign="center"
                                                                        fontWeight={mainSelected ? "bold" : "normal"}
                                                                        width="100%"
                                                                    >
                                                                        {capitalizeFirstLetter(opcionObj.nombre)}
                                                                    </Text>
                                                                </Box>
                                                                {mainSelected && opcionObj.opciones && (
                                                                    <Box mt={2}>
                                                                        {opcionObj.tipo === "escoger" && Array.isArray(opcionObj.opciones) && typeof opcionObj.opciones[0] === "string" && (
                                                                            <SimpleGrid columns={opcionObj.opciones.length < 4 ? opcionObj.opciones.length : 4} spacing={2}>
                                                                                {opcionObj.opciones.map((subOpcion, subOpcionIndex) => {
                                                                                    const subSelected = formValues[`${step.nombre}_${campo.nombre}_sub`] === subOpcion;
                                                                                    return (
                                                                                        <Box
                                                                                            key={subOpcionIndex}
                                                                                            p={2}
                                                                                            borderRadius="md"
                                                                                            border="2px solid"
                                                                                            borderColor={subSelected ? snap.color : "gray.600"}
                                                                                            bg={subSelected ? `${snap.color}20` : "transparent"}
                                                                                            cursor="pointer"
                                                                                            onClick={() => {
                                                                                                setFormValues({
                                                                                                    ...formValues,
                                                                                                    [`${step.nombre}_${campo.nombre}_sub`]: subOpcion
                                                                                                });
                                                                                            }}
                                                                                            _hover={{
                                                                                                borderColor: snap.color,
                                                                                                bg: `${snap.color}10`
                                                                                            }}
                                                                                            transition="all 0.2s"
                                                                                            margin="2px"
                                                                                            width="120px"
                                                                                            display="flex"
                                                                                            alignItems="center"
                                                                                            justifyContent="center"
                                                                                        >
                                                                                            <Text
                                                                                                color={subSelected ? snap.color : "gray.400"}
                                                                                                textAlign="center"
                                                                                                fontWeight={subSelected ? "bold" : "normal"}
                                                                                                width="100%"
                                                                                            >
                                                                                                {capitalizeFirstLetter(subOpcion)}
                                                                                            </Text>
                                                                                        </Box>
                                                                                    );
                                                                                })}
                                                                            </SimpleGrid>
                                                                        )}
                                                                        {opcionObj.tipo === "escoger-tipo" && Array.isArray(opcionObj.opciones) && typeof opcionObj.opciones[0] === "object" && (
                                                                            <VStack spacing={2} align="center">
                                                                                {opcionObj.opciones.map((subObj, subObjIndex) => (
                                                                                    <Box key={subObjIndex} p={2} borderRadius="md" border="2px dashed" borderColor="gray.500" width="100%">
                                                                                        <Text color="gray.300" fontWeight="bold" textAlign="center">
                                                                                            {capitalizeFirstLetter(subObj.nombre)}
                                                                                        </Text>
                                                                                        {subObj.tipo === "color" && (
                                                                                            <ColorSelector
                                                                                                stepNombre={step.nombre}
                                                                                                campoNombre={campo.nombre}
                                                                                                subObjNombre={subObj.nombre}
                                                                                            />
                                                                                        )}
                                                                                    </Box>
                                                                                ))}
                                                                            </VStack>
                                                                        )}
                                                                    </Box>
                                                                )}
                                                            </Box>
                                                        );
                                                    })}
                                                </SimpleGrid>
                                            </Box>
                                        )}

                                        {campo.tipo === "input-number" && (
                                            <Box width="100%" display="flex" justifyContent="center">
                                                <SimpleGrid
                                                    columns={2}
                                                    spacing={4}
                                                    width="100%"
                                                >
                                                    {campo.opciones && campo.opciones.map((opcion, opcionIndex) => (
                                                        <Box key={opcionIndex} margin="10px">
                                                            <Text color={snap.color} mb={2}>
                                                                {capitalizeFirstLetter(opcion)}
                                                            </Text>
                                                            <NumberInput
                                                                stepNombre={step.nombre}
                                                                campoNombre={campo.nombre}
                                                                opcion={opcion}
                                                            />
                                                        </Box>
                                                    ))}
                                                </SimpleGrid>
                                            </Box>
                                        )}
                                    </Box>
                                ))}


                                {!isStepComplete(index) && (
                                    <Text color="red.500" fontSize="sm" textAlign="center" mt={2}>
                                        Por favor, complete todos los campos de este paso para continuar
                                    </Text>
                                )}
                            </VStack>
                        </Box>
                    ))}
                </Box>

                {/* Navigation Buttons */}
                <ButtonGroup size="sm" variant="outline" width="100%" spacing={4} mt={4}>
                    <Button
                        bg={snap.color}
                        color="black"
                        width="50%"
                        _hover={{ bg: "yellow.500" }}
                        disabled={currentStep === 0}
                        onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                    >
                        Paso anterior
                    </Button>
                    {currentStep === detailsData.length - 1 ? (
                        <Button
                            bg={snap.colorGreen}
                            color="white"
                            width="50%"
                            _hover={{ bg: "green.500" }}
                            disabled={!isStepComplete(currentStep)}
                            onClick={() => {
                                state.currentOrder.details = formValues;
                                state.pickColor = false;
                                state.pickSize = true;
                                navigate("/control-panel/current-order/size");
                            }}
                        >
                            Confirmar selección
                        </Button>
                    ) : (
                        <Button
                            bg={snap.color}
                            color="black"
                            width="50%"
                            _hover={{ bg: "yellow.500" }}
                            disabled={!isStepComplete(currentStep)}
                            onClick={() => setCurrentStep(prev => Math.min(detailsData.length - 1, prev + 1))}
                        >
                            Paso siguiente
                        </Button>
                    )}
                </ButtonGroup>
            </Box>
        );
    };

    return (
        <>
            <Flex
                align="center"
                justify="center"
                bg="black"
            >
                <Box
                    w={["95%", "90%", "80%", "70%"]}
                    bg="black"
                    p={[2, 3, 4, 6]}
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
                            state.currentOrder.codeSelected = selectedColor.code;
                            state.currentOrder.colorSelected = selectedColor.color;
                            setSubmitting(false);
                            navigate("/control-panel/size");
                        }}
                    >
                        {({ values, setFieldValue, isSubmitting }) => (
                            <Form style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <VStack spacing={3} align="stretch" height="100%">
                                    {/* Fixed Header */}
                                    <Box flexShrink={0}>
                                        <Text fontSize={headerFontSize} fontWeight="bold" color={snap.color} textAlign="center" mb={2}>
                                            Seleccionar detalles
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

                                    <CustomStepper />

                                    {/* {currentStep === detailsData.length - 1 && (
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
                                                _hover={{ bg: "yellow.500" }}
                                                _active={{ bg: "yellow.500" }}
                                                disabled={loading || !values.color}
                                            >
                                                Confirmar selección
                                            </Button>
                                        </Box>
                                    )} */}
                                </VStack>
                            </Form>
                        )}
                    </Formik>
                </Box>
            </Flex>
        </>
    );
};

export default DetailsForm;