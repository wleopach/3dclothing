import { Box, Button, Flex, Text, useBreakpointValue, VStack, ButtonGroup, SimpleGrid, Popover, Portal, Input, Dialog } from "@chakra-ui/react";
import { Tooltip } from "@/components/ui/tooltip"
import { DialogRoot, DialogContent, DialogHeader, DialogBody, DialogBackdrop } from "@/components/ui/dialog"
import { Form, Formik, Field } from "formik";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { useSnapshot } from "valtio";
import { state } from "../store";
import axiosInstance from "../axiosConfig";
import ModelSelectorDialog from "./chothing-model/ModelSelectorDialog.jsx";


const DetailsForm = () => {
    const snap = useSnapshot(state);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedColor, setSelectedColor] = useState(null);
    const [detailsData, setDetailsData] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [formValues, setFormValues] = useState({});
    const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
    const [currentModelField, setCurrentModelField] = useState(null);
    const [currentModelType, setCurrentModelType] = useState(null);

    // Helper function to check if model selector is required
    const isModelSelectorRequired = (campo) => {
        if (!campo["selector-de-modelo"]) return false;
        // If it's an object, check the obligatorio property
        if (typeof campo["selector-de-modelo"] === "object") {
            return campo["selector-de-modelo"].obligatorio !== false;
        }
        // Legacy support: if it's true, it's required
        return campo["selector-de-modelo"] === true;
    };

    // Helper function to get model type
    const getModelType = (campo) => {
        if (!campo["selector-de-modelo"]) return null;
        // If it's an object, get the tipo property
        if (typeof campo["selector-de-modelo"] === "object") {
            return campo["selector-de-modelo"].tipo;
        }
        // Legacy support: get from tipo-selector-de-modelo
        return campo["tipo-selector-de-modelo"];
    };

    // Cargar los valores guardados cuando el componente se monta o cuando cambia el estado
    useEffect(() => {
        if (state.currentOrder.details) {
            try {
                // Si details es un string JSON, parsearlo
                const parsedDetails = typeof state.currentOrder.details === 'string'
                    ? JSON.parse(state.currentOrder.details)
                    : state.currentOrder.details;
                setFormValues(parsedDetails);
            } catch (error) {
                setFormValues(state.currentOrder.details);
            }
        } else {
            // Si no hay datos guardados, inicializar con objeto vacío
            setFormValues({});
        }
    }, [state.currentOrder.details, snap.currentOrder.details]);


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

    const getStepValidationErrors = (stepIndex) => {
        const currentStepData = detailsData[stepIndex];
        if (!currentStepData || !currentStepData.campos) return [];

        const errors = [];
        currentStepData.campos.forEach(campo => {
            const fieldName = `${currentStepData.nombre}_${campo.nombre}`;

            // Handle case where field only has selector-de-modelo without tipo
            if (!campo.tipo && campo["selector-de-modelo"]) {
                const hasModelSelection = formValues[`${fieldName}_modelo`] !== undefined;
                const isRequired = isModelSelectorRequired(campo);
                
                if (isRequired && !hasModelSelection) {
                    errors.push(`Debe seleccionar un modelo para "${campo.nombre}"`);
                }
            }

            if (campo.tipo === "escoger") {
                if (campo["selector-de-modelo"]) {
                    const hasNormalSelection = formValues[fieldName] && formValues[fieldName].trim() !== '';
                    const hasModelSelection = formValues[`${fieldName}_modelo`] !== undefined;

                    if (campo.obligatorio === false) {
                        if (hasNormalSelection && !hasModelSelection) {
                            errors.push(`Debe seleccionar un modelo para "${campo.nombre}"`);
                        }
                    } else {
                        if (!hasNormalSelection) {
                            errors.push(`Debe seleccionar una opción para "${campo.nombre}"`);
                        }
                        if (hasNormalSelection && !hasModelSelection) {
                            errors.push(`Debe seleccionar un modelo para "${campo.nombre}"`);
                        }
                    }
                } else {
                    if (campo.obligatorio !== false && (!formValues[fieldName] || formValues[fieldName].trim() === '')) {
                        errors.push(`Debe seleccionar una opción para "${campo.nombre}"`);
                    }
                }
            }

            if (campo.tipo === "escoger-multi-campo") {
                if (campo["selector-de-modelo"]) {
                    const hasNormalSelection = formValues[`${fieldName}_main`] && formValues[`${fieldName}_sub`] && formValues[`${fieldName}_sub`].trim() !== '';
                    const hasModelSelection = formValues[`${fieldName}_modelo`] !== undefined;

                    if (campo.obligatorio === false) {
                        if (hasNormalSelection && !hasModelSelection) {
                            errors.push(`Debe seleccionar un modelo para "${campo.nombre}"`);
                        }
                    } else {
                        if (!hasNormalSelection) {
                            errors.push(`Debe completar la selección para "${campo.nombre}"`);
                        }
                        if (hasNormalSelection && !hasModelSelection) {
                            errors.push(`Debe seleccionar un modelo para "${campo.nombre}"`);
                        }
                    }
                } else {
                    if (campo.obligatorio !== false && (!formValues[`${fieldName}_main`] || !formValues[`${fieldName}_sub`] || formValues[`${fieldName}_sub`].trim() === '')) {
                        errors.push(`Debe completar la selección para "${campo.nombre}"`);
                    }
                }
            }

            if (campo.tipo === "input-number") {
                if (campo.obligatorio !== false) {
                    const hasEmptyValues = campo.opciones.some(opcion => {
                        const value = formValues[`${fieldName}_${opcion}`];
                        return value === undefined || value === '';
                    });
                    if (hasEmptyValues) {
                        errors.push(`Debe completar todos los valores para "${campo.nombre}"`);
                    }
                }
            }
        });

        return errors;
    };

    const isStepComplete = (stepIndex) => {
        const currentStepData = detailsData[stepIndex];
        if (!currentStepData || !currentStepData.campos) return false;

        return currentStepData.campos.every(campo => {
            const fieldName = `${currentStepData.nombre}_${campo.nombre}`;

            // Handle case where field only has selector-de-modelo without tipo
            if (!campo.tipo && campo["selector-de-modelo"]) {
                const hasModelSelection = formValues[`${fieldName}_modelo`] !== undefined;
                const isRequired = isModelSelectorRequired(campo);
                
                if (isRequired) {
                    return hasModelSelection;
                }
                return true; // Optional model selector
            }

            // Handle different field types
            if (campo.tipo === "escoger") {
                // Check if field has model selector requirement
                if (campo["selector-de-modelo"]) {
                    const hasNormalSelection = formValues[fieldName] && formValues[fieldName].trim() !== '';
                    const hasModelSelection = formValues[`${fieldName}_modelo`] !== undefined;

                    // If field is optional (obligatorio === false)
                    if (campo.obligatorio === false) {
                        // If a normal option is selected, then model selection becomes mandatory
                        if (hasNormalSelection) {
                            return hasModelSelection;
                        }
                        // If no normal option is selected, field is valid (optional)
                        return true;
                    } else {
                        // If field is mandatory (obligatorio === true or undefined), both normal option and model are required
                        return hasNormalSelection && hasModelSelection;
                    }
                }

                // If no model selector, just check if option is selected
                if (campo.obligatorio === false) {
                    return true; // Optional field without model selector
                }
                return formValues[fieldName] && formValues[fieldName].trim() !== '';
            }

            // console.log(formValues);
            if (campo.tipo === "escoger-multi-campo") {
                // Check if field has model selector requirement
                if (campo["selector-de-modelo"]) {
                    const hasNormalSelection = formValues[`${fieldName}_main`] && formValues[`${fieldName}_sub`] && formValues[`${fieldName}_sub`].trim() !== '';
                    const hasModelSelection = formValues[`${fieldName}_modelo`] !== undefined;

                    // If field is optional (obligatorio === false)
                    if (campo.obligatorio === false) {
                        // If a normal option is selected, then model selection becomes mandatory
                        if (hasNormalSelection) {
                            return hasModelSelection;
                        }
                        // If no normal option is selected, field is valid (optional)
                        return true;
                    } else {
                        // If field is mandatory (obligatorio === true or undefined), both normal option and model are required
                        return hasNormalSelection && hasModelSelection;
                    }
                }

                // If no model selector, check if main option is selected
                const mainSelected = formValues[`${fieldName}_main`];
                if (campo.obligatorio === false) {
                    return true; // Optional field without model selector
                }
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

    const handleOpenModelSelector = (stepNombre, campoNombre, typoModelo) => {
        setCurrentModelType(typoModelo);
        setCurrentModelField({ stepNombre, campoNombre });
        setIsModelSelectorOpen(true);
    };

    const handleCloseModelSelector = () => {
        setIsModelSelectorOpen(false);
        setCurrentModelField(null);
    };

    const handleModelSelection = (selectedModelData) => {
        if (currentModelField) {
            const { stepNombre, campoNombre } = currentModelField;
            const newValues = { ...formValues };
            newValues[`${stepNombre}_${campoNombre}_modelo`] = selectedModelData;
            setFormValues(newValues);
        }
        handleCloseModelSelector();
    };

    const NumberInput = ({ stepNombre, campoNombre, opcion }) => {
        const [localValue, setLocalValue] = useState(formValues[`${stepNombre}_${campoNombre}_${opcion}`] || '');
        const timeoutRef = useRef(null);

        const handleChange = (e) => {
            const value = e.target.value;
            setLocalValue(value);

            // Limpiar el timeout anterior si existe
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            // Actualizar formValues después de un breve delay
            timeoutRef.current = setTimeout(() => {
                if (value === '' || !isNaN(value)) {
                    handleNumberInputChange(stepNombre, campoNombre, opcion, value);
                }
            }, 500);
        };

        // Limpiar el timeout cuando el componente se desmonte
        useEffect(() => {
            return () => {
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }
            };
        }, []);

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

    const renderClearButton = (handleClick) => {

        return (
            <Tooltip
                content="Eliminar el dato seleccionado"
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
                    Borrar
                </Button>
            </Tooltip>
        );
    };

    const ModelSelectorButton = ({ stepNombre, campoNombre, typoModelo, isSelected }) => {
        const selectedModel = formValues[`${stepNombre}_${campoNombre}_modelo`];

        return (
            <VStack spacing={2} width="100%">
                <Button
                    size="md"
                    bg={isSelected ? snap.color : "gray.600"}
                    color={isSelected ? "black" : "white"}
                    _hover={{
                        bg: isSelected ? "yellow.500" : "gray.500"
                    }}
                    onClick={() => handleOpenModelSelector(stepNombre, campoNombre, typoModelo)}
                    width="100%"
                    height="60px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    gap={2}
                >
                    {selectedModel ? (
                        <>
                            <Text fontSize="sm">Modelo seleccionado</Text>
                            <Box
                                width="20px"
                                height="20px"
                                borderRadius="sm"
                                backgroundColor={selectedModel.colors ? getRgbColor(Object.values(selectedModel.colors)[0]) : snap.color}
                                border="1px solid white"
                            />
                        </>
                    ) : (
                        <Text fontSize="sm">Seleccionar modelo</Text>
                    )}
                </Button>
                {selectedModel && (
                    renderClearButton(() => {
                        const newValues = { ...formValues };
                        delete newValues[`${stepNombre}_${campoNombre}_modelo`];
                        setFormValues(newValues);
                    })
                )}
            </VStack>
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

        const handleClearColor = () => {
            const newValues = { ...formValues };
            delete newValues[`${stepNombre}_${campoNombre}_${subObjNombre}`];
            setFormValues(newValues);
            setSelectedColorData(null);
        };

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
                            <VStack spacing={2} width="100%">
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
                                    width="100%"
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
                                        <Text color="white" fontSize="sm" textAlign="center" margin="auto">
                                            Seleccionar color
                                        </Text>
                                    )}
                                </Box>
                                {selectedColorData && (
                                    renderClearButton(() => handleClearColor())
                                )}
                            </VStack>
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
                                                renderClearButton(() => handleClearSelection(step.nombre, campo.nombre))
                                            }
                                            {campo.obligatorio === false && formValues[`${step.nombre}_${campo.nombre}_main`] &&
                                                renderClearButton(() => handleClearMultiCampoSelection(step.nombre, campo.nombre))
                                            }
                                        </Text>

                                        {/* Helper function to get model type */}
                                        {(() => {
                                            // Handle case where field only has selector-de-modelo without tipo
                                            if (!campo.tipo && campo["selector-de-modelo"]) {
                                                return (
                                                    <Box width="100%" display="flex" justifyContent="center">
                                                        <ModelSelectorButton
                                                            stepNombre={step.nombre}
                                                            campoNombre={campo.nombre}
                                                            typoModelo={getModelType(campo)}
                                                            isSelected={formValues[`${step.nombre}_${campo.nombre}_modelo`] !== undefined}
                                                        />
                                                    </Box>
                                                );
                                            }

                                            return null;
                                        })()}

                                        {campo.tipo === "escoger" && campo.opciones && campo.opciones.length > 0 && (
                                            <Box width="100%" display="flex" justifyContent="center">
                                                <VStack spacing={4} width="100%">
                                                    {/* Opciones originales */}
                                                    <SimpleGrid
                                                        columns={{ base: 1, sm: 2, md: campo.opciones.length < 3 ? campo.opciones.length : 3 }}
                                                        spacing={{ base: 2, sm: 3, md: 4 }}
                                                        display="inline-grid"
                                                        width={{ base: "100%", sm: "auto" }}
                                                    >
                                                        {campo.opciones.map((opcion, opcionIndex) => {
                                                            const isSelected = formValues[`${step.nombre}_${campo.nombre}`] === opcion;
                                                            return (
                                                                <Box
                                                                    key={opcionIndex}
                                                                    p={{ base: 2, sm: 3, md: 4 }}
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
                                                                    margin={{ base: "2px", sm: "3px", md: "5px" }}
                                                                    width={{ base: "100%", sm: "140px", md: "160px" }}
                                                                    height={{ base: "80px", sm: "90px", md: "100px" }}
                                                                    display="flex"
                                                                    alignItems="center"
                                                                    justifyContent="center"
                                                                >
                                                                    <Text
                                                                        color={isSelected ? snap.color : "gray.400"}
                                                                        textAlign="center"
                                                                        fontWeight={isSelected ? "bold" : "normal"}
                                                                        width="100%"
                                                                        fontSize={{ base: "sm", sm: "md" }}
                                                                    >
                                                                        {capitalizeFirstLetter(opcion)}
                                                                    </Text>
                                                                </Box>
                                                            );
                                                        })}
                                                    </SimpleGrid>

                                                    {/* Botón de selector de modelo (si está habilitado) */}
                                                    {campo["selector-de-modelo"] && (
                                                        <Box width="100%" display="flex" justifyContent="center">
                                                            <ModelSelectorButton
                                                                stepNombre={step.nombre}
                                                                campoNombre={campo.nombre}
                                                                typoModelo={getModelType(campo)}
                                                                isSelected={formValues[`${step.nombre}_${campo.nombre}_modelo`] !== undefined}
                                                            />
                                                        </Box>
                                                    )}
                                                </VStack>
                                            </Box>
                                        )}

                                        {campo.tipo === "escoger-multi-campo" && campo.opciones && campo.opciones.length > 0 && (
                                            <Box width="100%" display="flex" justifyContent="center">
                                                <VStack spacing={4} width="100%">
                                                    {/* Opciones originales */}
                                                    <SimpleGrid
                                                        columns={{ base: 1, sm: 2, md: campo.opciones.length < 4 ? campo.opciones.length : 4 }}
                                                        spacing={{ base: 2, sm: 3, md: 4 }}
                                                        display="inline-grid"
                                                        width={{ base: "100%", sm: "auto" }}
                                                    >
                                                        {campo.opciones.map((opcionObj, opcionObjIndex) => {
                                                            const mainSelected = formValues[`${step.nombre}_${campo.nombre}_main`] === opcionObj.nombre;
                                                            return (
                                                                <Box key={opcionObjIndex} width="100%">
                                                                    <Box
                                                                        p={{ base: 2, sm: 3, md: 4 }}
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
                                                                        margin={{ base: "2px", sm: "3px", md: "5px" }}
                                                                        width={{ base: "100%", sm: "140px", md: "160px" }}
                                                                        height={{ base: "80px", sm: "90px", md: "100px" }}
                                                                        display="flex"
                                                                        alignItems="center"
                                                                        justifyContent="center"
                                                                    >
                                                                        <Text
                                                                            color={mainSelected ? snap.color : "gray.400"}
                                                                            textAlign="center"
                                                                            fontWeight={mainSelected ? "bold" : "normal"}
                                                                            width="100%"
                                                                            fontSize={{ base: "sm", sm: "md" }}
                                                                        >
                                                                            {capitalizeFirstLetter(opcionObj.nombre)}
                                                                        </Text>
                                                                    </Box>
                                                                    {mainSelected && opcionObj.opciones && (
                                                                        <Box mt={2}>
                                                                            {opcionObj.tipo === "escoger" && Array.isArray(opcionObj.opciones) && typeof opcionObj.opciones[0] === "string" && (
                                                                                <SimpleGrid
                                                                                    columns={{ base: 1, sm: 2, md: opcionObj.opciones.length < 4 ? opcionObj.opciones.length : 4 }}
                                                                                    spacing={{ base: 2, sm: 3, md: 4 }}
                                                                                >
                                                                                    {opcionObj.opciones.map((subOpcion, subOpcionIndex) => {
                                                                                        const subSelected = formValues[`${step.nombre}_${campo.nombre}_sub`] === subOpcion;
                                                                                        return (
                                                                                            <Box
                                                                                                key={subOpcionIndex}
                                                                                                p={{ base: 2, sm: 3 }}
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
                                                                                                margin={{ base: "2px", sm: "3px" }}
                                                                                                width={{ base: "100%", sm: "120px" }}
                                                                                                display="flex"
                                                                                                alignItems="center"
                                                                                                justifyContent="center"
                                                                                            >
                                                                                                <Text
                                                                                                    color={subSelected ? snap.color : "gray.400"}
                                                                                                    textAlign="center"
                                                                                                    fontWeight={subSelected ? "bold" : "normal"}
                                                                                                    width="100%"
                                                                                                    fontSize={{ base: "sm", sm: "md" }}
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

                                                    {/* Botón de selector de modelo (si está habilitado) */}
                                                    {campo["selector-de-modelo"] && (
                                                        <Box width="100%" display="flex" justifyContent="center">
                                                            <ModelSelectorButton
                                                                stepNombre={step.nombre}
                                                                campoNombre={campo.nombre}
                                                                typoModelo={getModelType(campo)}
                                                                isSelected={formValues[`${step.nombre}_${campo.nombre}_modelo`] !== undefined}
                                                            />
                                                        </Box>
                                                    )}
                                                </VStack>
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


                                {(() => {
                                    const errors = getStepValidationErrors(index);
                                    return errors.length > 0 && (
                                        <VStack spacing={1} mt={2}>
                                            {errors.map((error, errorIndex) => (
                                                <Text key={errorIndex} color="red.500" fontSize="sm" textAlign="center">
                                                    {error}
                                                </Text>
                                            ))}
                                        </VStack>
                                    );
                                })()}
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

            {/* Model Selector Dialog */}
            <ModelSelectorDialog
                isOpen={isModelSelectorOpen}
                onClose={handleCloseModelSelector}
                onModelSelect={(modelData) => {
                    const selectedModel = {
                        modelIndex: modelData.selectedCollar,
                        colors: modelData.colors,
                        modelName: `Modelo ${modelData.selectedCollar + 1}`,
                        modelType: currentModelType
                    };
                    handleModelSelection(selectedModel);
                }}
                initialModelData={currentModelField ? formValues[`${currentModelField.stepNombre}_${currentModelField.campoNombre}_modelo`] : null}
                modelType={currentModelType}
            />
        </>
    );
};

export default DetailsForm;