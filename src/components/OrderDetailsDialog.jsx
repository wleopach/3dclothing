import {
    Badge,
    Box,
    CloseButton,
    IconButton,
    Portal,
    SimpleGrid,
    Text,
    VStack,
    Button
} from "@chakra-ui/react";
import { LuSearch, LuEye } from "react-icons/lu";
import { useState } from "react";
import ModelSelectorDialog from "./chothing-model/ModelSelectorDialog.jsx";
import {
    DialogRoot,
    DialogContent,
    DialogHeader,
    DialogBody,
    DialogBackdrop,
    DialogTitle,
    DialogTrigger,
    DialogCloseTrigger
} from "@/components/ui/dialog";
import log from "eslint-plugin-react/lib/util/log.js";

const OrderDetailsDialog = ({ details, productName }) => {
    const [isModelViewerOpen, setIsModelViewerOpen] = useState(false);
    const [currentModelData, setCurrentModelData] = useState(null);

    // Función para determinar si el producto es blusa
    const isBlusa = () => {
        if (!productName) return false;
        return productName.toLowerCase().includes('blusa');
    };

    // Función para formatear las claves del JSON
    const formatKey = (key) => {
        // Mapeo personalizado para campos específicos
        const fieldMappings = {
            'personName': 'Nombre de la persona',
            'personRole': 'Cargo de la persona'
        };

        return key
            .split('_')
            .map(word => {
                // Si la palabra está en el mapeo personalizado, usar ese valor
                if (fieldMappings[word]) {
                    return fieldMappings[word];
                }
                // Si no, aplicar la capitalización normal
                return word.charAt(0).toUpperCase() + word.slice(1);
            })
            .join(' ');
    };

    // Función para obtener el color RGB
    const getRgbColor = (colorStr) => {
        if (!colorStr || typeof colorStr !== "string") {
            return "gray";
        }
        try {
            const rgbMatch = colorStr.match(/\((\d+),(\d+),(\d+)\)/);
            if (rgbMatch && rgbMatch.length === 4) {
                const [_, r, g, b] = rgbMatch;
                return `rgb(${r}, ${g}, ${b})`;
            }
            return "gray";
        } catch (error) {
            return "gray";
        }
    };

    // Función para renderizar el valor según su tipo
    const renderValue = (value) => {
        if (typeof value === 'object' && value !== null) {
            if (value.color) {
                return (
                    <Box display="flex" alignItems="center" gap={2}>
                        <Box
                            width="24px"
                            height="24px"
                            borderRadius="md"
                            backgroundColor={getRgbColor(value.color)}
                            border="2px solid white"
                        />
                        <Text>{value.code}</Text>
                    </Box>
                );
            }
            return JSON.stringify(value);
        }
        return value;
    };

    // Función para encontrar modelos seleccionados en los detalles
    const findSelectedModels = () => {
        const models = [];
        Object.entries(details).forEach(([key, value]) => {
            if (key.endsWith('_modelo') && typeof value === 'object' && value !== null) {
                const fieldName = key.replace('_modelo', '');
                const formattedFieldName = formatKey(fieldName);

                // Buscar información adicional del mismo campo
                const imageData = details[`${fieldName}_imageData`];
                const personName = details[`${fieldName}_personName`];
                const personRole = details[`${fieldName}_personRole`];

                // Crear objeto completo con toda la información
                const completeModelData = {
                    ...value,
                    imageData: imageData,
                    personName: personName,
                    personRole: personRole
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

    // Función para encontrar tipos seleccionados (no modelos) en los detalles
    const findSelectedTypes = () => {
        const types = [];
        Object.entries(details).forEach(([key, value]) => {
            // Excluir campos que terminan en _modelo y campos que son objetos
            if (!key.endsWith('_modelo') && typeof value !== 'object' && value !== null && value !== '') {
                const formattedFieldName = formatKey(key);
                types.push({
                    fieldName: formattedFieldName,
                    value: value,
                    originalKey: key
                });
            }
        });
        return types;
    };

    // Función para abrir el visor de modelos
    const handleOpenModelViewer = (modelData) => {
        setCurrentModelData(modelData);
        setIsModelViewerOpen(true);
    };

    // Función para cerrar el visor de modelos
    const handleCloseModelViewer = () => {
        setIsModelViewerOpen(false);
        setCurrentModelData(null);
    };

    // Agrupar los detalles por sección
    const groupedDetails = Object.entries(details).reduce((acc, [key, value]) => {
        const [section] = key.split('_');
        if (!acc[section]) {
            acc[section] = {};
        }
        acc[section][key] = value;
        return acc;
    }, {});

    // Componente reutilizable para cada dato
    const DetailBox = ({ label, value, isColorBox, subValue = '' }) => (
        <Box
            p={2}
            m={1}
            borderRadius="lg"
            borderWidth="1.5px"
            borderColor="blue.200"
            bg="whiteAlpha.900"
            boxShadow="md"
            minH="56px"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            gap={1}
            transition="all 0.2s"
            _hover={{ boxShadow: "xl", borderColor: "blue.400", transform: "scale(1.02)" }}
        >
            <Text fontSize="sm" fontWeight="bold" color="blue.800" mb={0} letterSpacing="wide">
                {label}
            </Text>
            <Box color="gray.800" fontSize="md" fontWeight="medium" display="flex" alignItems="center" gap={2}>
                {isColorBox ? value : <>{value} {subValue}</>}
            </Box>
        </Box>
    );

    // Componente para mostrar un modelo seleccionado
    const ModelBox = ({ fieldName, modelData, originalKey }) => (
        <Box
            p={3}
            m={1}
            borderRadius="lg"
            borderWidth="2px"
            borderColor="green.400"
            bg="green.50"
            boxShadow="md"
            minH="80px"
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
            gap={2}
            transition="all 0.2s"
            _hover={{ boxShadow: "xl", borderColor: "green.500", transform: "scale(1.02)" }}
        >
            <Text fontSize="sm" fontWeight="bold" color="green.800" mb={0} letterSpacing="wide">
                {fieldName}
            </Text>
            <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="center" gap={2}>
                    <Text color="gray.700" fontSize="sm" fontWeight="medium">
                        {modelData.modelName || `Modelo ${modelData.modelIndex + 1}`}
                    </Text>
                    {modelData.colors && Object.values(modelData.colors)[0] && (
                        <Box
                            width="20px"
                            height="20px"
                            borderRadius="sm"
                            backgroundColor={getRgbColor(Object.values(modelData.colors)[0])}
                            border="1px solid white"
                        />
                    )}
                </Box>
                <Button
                    size="sm"
                    bg="green.500"
                    color="white"
                    _hover={{ bg: "green.600" }}
                    leftIcon={<LuEye />}
                    onClick={() => handleOpenModelViewer(modelData)}
                >
                    Ver modelo
                </Button>
            </Box>
        </Box>
    );

    const selectedModels = findSelectedModels();
    const selectedTypes = findSelectedTypes();

    return (
        <>
            <DialogRoot placement="center" motionPreset="slide-in-bottom">
                <DialogTrigger>
                    <IconButton bg="blue.500" color="white" _hover={{ bg: "blue.600" }} px={2}>
                        <LuSearch />
                        Ver detalles
                    </IconButton>
                </DialogTrigger>

                <DialogContent
                    bg="gray.900"
                    borderRadius="2xl"
                    boxShadow="2xl"
                    p={0}
                    borderWidth="2px"
                    borderColor="blue.400"
                    animation="fadeIn 0.4s"
                >
                    <DialogHeader px={8} pt={8} pb={2} bg="transparent">
                        <DialogTitle fontSize="2xl" fontWeight="bold" color="white" letterSpacing="wide">
                            Detalles de la Orden
                        </DialogTitle>
                        <DialogCloseTrigger>
                            <CloseButton size="sm" color="red" bg="white" _hover={{ bg: "gray.100" }} />
                        </DialogCloseTrigger>
                    </DialogHeader>
                    <DialogBody px={8} pb={8} pt={2}>
                        <VStack spacing={8} align="stretch">
                            {isBlusa() ? (
                                // Visualización para blusas: solo modelos y tipos
                                <>
                                    {/* Modelos Seleccionados */}
                                    {selectedModels.length > 0 && (
                                        <>
                                            <Box>
                                                <Badge
                                                    bg="blackAlpha.800"
                                                    color="white"
                                                    fontSize="md"
                                                    p={2}
                                                    borderRadius="md"
                                                    mb={3}
                                                    fontWeight="bold"
                                                >
                                                    Modelos Seleccionados
                                                </Badge>
                                                <SimpleGrid columns={1} spacingY={3}>
                                                    {selectedModels.map((model, index) => (
                                                        <ModelBox
                                                            key={index}
                                                            fieldName={model.fieldName}
                                                            modelData={model.modelData}
                                                        />
                                                    ))}
                                                </SimpleGrid>
                                            </Box>
                                            <Box borderBottomWidth="1px" borderColor="blue.200" my={2} />
                                        </>
                                    )}

                                    {/* Bolsillos */}
                                    {selectedTypes.length > 0 && (
                                        <>
                                            <Box>
                                                <Badge
                                                    bg="blackAlpha.800"
                                                    color="white"
                                                    fontSize="md"
                                                    p={2}
                                                    borderRadius="md"
                                                    mb={3}
                                                    fontWeight="bold"
                                                >
                                                    Bolsillos
                                                </Badge>
                                                <SimpleGrid columns={2} spacingX={4} spacingY={3}>
                                                    {selectedTypes.map((type, index) => (
                                                        <DetailBox
                                                            key={index}
                                                            label={type.fieldName}
                                                            value={type.value}
                                                        />
                                                    ))}
                                                </SimpleGrid>
                                            </Box>
                                        </>
                                    )}
                                </>
                            ) : (
                                // Visualización para pantalones: mantener la estructura actual
                                <>
                                    {/* Modelos Seleccionados */}
                                    {selectedModels.length > 0 && (
                                        <>
                                            <Box>
                                                <Badge
                                                    bg="green.600"
                                                    color="white"
                                                    fontSize="md"
                                                    p={2}
                                                    borderRadius="md"
                                                    mb={3}
                                                    fontWeight="bold"
                                                >
                                                    Modelos Seleccionados
                                                </Badge>
                                                <SimpleGrid columns={1} spacingY={3}>
                                                    {selectedModels.map((model, index) => (
                                                        <ModelBox
                                                            key={index}
                                                            fieldName={model.fieldName}
                                                            modelData={model.modelData}
                                                        />
                                                    ))}
                                                </SimpleGrid>
                                            </Box>
                                            <Box borderBottomWidth="1px" borderColor="blue.200" my={2} />
                                        </>
                                    )}

                                    {/* Pretina */}
                                    <Box>
                                        <Badge
                                            bg="blackAlpha.800"
                                            color="white"
                                            fontSize="md"
                                            p={2}
                                            borderRadius="md"
                                            mb={3}
                                            fontWeight="bold"
                                        >
                                            Pretina
                                        </Badge>
                                        <SimpleGrid columns={2} spacingX={4} spacingY={3}>
                                            <DetailBox label="Pretina Caucho" value={details["pretina_Pretina Caucho"]} />
                                            <DetailBox label="Pretina" value={details["pretina_Pretina"]} />
                                        </SimpleGrid>
                                    </Box>
                                    <Box borderBottomWidth="1px" borderColor="blue.200" my={2} />
                                    {/* Bolsillos */}
                                    <Box>
                                        <Badge
                                            bg="blackAlpha.800"
                                            color="white"
                                            fontSize="md"
                                            p={2}
                                            borderRadius="md"
                                            mb={3}
                                            fontWeight="bold"
                                        >
                                            Bolsillos
                                        </Badge>
                                        <SimpleGrid columns={2} spacingX={4} spacingY={3}>
                                            <DetailBox label="Tipo de Bolsillo Lateral" value={details["bolsillos_lateral_main"] + " --> " + details["bolsillos_lateral_sub"]} />
                                            <br />
                                            <DetailBox label="Parche trasero" value={details["bolsillos_parche trasero_main"] ? (details["bolsillos_parche trasero_main"] + " --> " + details["bolsillos_parche trasero_sub"]) : "Ninguno"} />
                                            <DetailBox label="Parche rodilla" value={details["bolsillos_parche rodilla_main"] ? (details["bolsillos_parche rodilla_main"] + " --> " + details["bolsillos_parche rodilla_sub"]) : "Ninguno"} />
                                        </SimpleGrid>
                                    </Box>
                                    <Box borderBottomWidth="1px" borderColor="blue.200" my={2} />
                                    {/* Bota */}
                                    <Box>
                                        <Badge
                                            bg="blackAlpha.800"
                                            color="white"
                                            fontSize="md"
                                            p={2}
                                            borderRadius="md"
                                            mb={3}
                                            fontWeight="bold"
                                        >
                                            Bota
                                        </Badge>
                                        <SimpleGrid columns={2} spacingX={4} spacingY={3}>
                                            <DetailBox label="Tipo bota" value={details["bota_Tipo bota"]} />
                                            <br />
                                            <DetailBox label="Dimensiones Ancho" value={details["bota_Dimensiones_Ancho"]} subValue="cm" />
                                            <DetailBox label="Dimensiones Largo" value={details["bota_Dimensiones_Largo"]} subValue="cm" />
                                        </SimpleGrid>
                                    </Box>
                                </>
                            )}
                        </VStack>
                    </DialogBody>
                </DialogContent>
            </DialogRoot>

            {/* Model Selector Dialog para visualizar modelos */}
            <ModelSelectorDialog
                isOpen={isModelViewerOpen}
                onClose={handleCloseModelViewer}
                onModelSelect={null} // No permitir selección, solo visualización
                initialModelData={currentModelData}
                title="Visualizar Modelo Seleccionado"
                showModelButtons={false}
                modelType={currentModelData?.modelType}
                showUploadedImage={true} // Mostrar imagen subida si existe
            />
        </>
    );
};

export default OrderDetailsDialog;