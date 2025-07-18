import './ClothingModelSelector.css'
import { Box, Text, Flex, VStack, Center, Button } from "@chakra-ui/react"
import React from 'react'
import { modelo3, modelo15, modelo6, modelo17, modelo10, modelo5,
    modelo18, modelo8, modelo9, pantalon6, modelo20, pantalon11,
    modelo12, modelo1, modelo7, modelo19, modelo2, pantalon10,
    pantalon9, pantalon1, pantalon7, modelo16, modelo14, pantalon4,
    modelo13, pantalon8, pantalon2, modelo4, pantalon5, modelo11, pantalon3 }
    from './collars/Collars';
import { useSnapshot } from "valtio";
import { state } from "../../store";
import axiosInstance from "../../axiosConfig";
import types from "./collars/TypeMap";

function ClothingModelSelector({ onModelSelect, initialModelData, typoModelo, showModelButtons = true }) {
    const snap = useSnapshot(state);
    const fontSize = "sm";
    const colorBoxSize = "50px";

    // Array of all models for easy access
    let modelos = [
        modelo3, modelo15, modelo6, modelo17, modelo10, modelo5,
        modelo18, modelo8, modelo9, pantalon6, modelo20, pantalon11,
        modelo12, modelo1, modelo7, modelo19, modelo2, pantalon10,
        pantalon9, pantalon1, pantalon7, modelo16, modelo14, pantalon4,
        modelo13, pantalon8, pantalon2, modelo4, pantalon5, modelo11, pantalon3
    ];

    if (typoModelo) {
        modelos = types[typoModelo]
    }

    // Get all unique color part IDs from all models
    const getAllColorIds = () => {
        const allIds = new Set();
        modelos.forEach(modelo => {
            if (modelo && modelo.color) {
                Object.keys(modelo.color).forEach(id => allIds.add(id));
            }
        });
        return Array.from(allIds);
    };

    // Initialize colors for all possible parts
    const initializeColors = () => {
        const allColorIds = getAllColorIds();
        const defaultColors = ['#FF0000', '#0000FF', '#00FF00', '#800080', '#FFFF00', '#FFA500', '#008080', '#FFC0CB'];
        const initialColors = {};

        allColorIds.forEach((colorId, index) => {
            initialColors[colorId] = defaultColors[index % defaultColors.length];
        });

        return initialColors;
    };

    const [colors, setColors] = React.useState(initializeColors());
    const [selectedPart, setSelectedPart] = React.useState(null);
    const [selectedCollar, setSelectedCollar] = React.useState(0); // Changed to index-based
    const [loading, setLoading] = React.useState(false);

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

    // Cargar colores del stock si no están en el store
    React.useEffect(() => {
        const fetchModelColors = async () => {
            if (!snap.currentOrder.stock) return;

            // Si ya tenemos colores en el store y el stock no ha cambiado, no hacer la llamada
            if (snap.modelColorsData.length > 0) return;

            setLoading(true);
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
                    state.modelColorsData = uniqueOptions;
                }
            } catch (error) {
                console.error("Error fetching model colors:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchModelColors();
    }, [snap.currentOrder.stock]);

    // Inicializar con los datos guardados si están disponibles
    React.useEffect(() => {
        if (initialModelData) {
            // Establecer el modelo seleccionado
            if (initialModelData.modelIndex !== undefined) {
                setSelectedCollar(initialModelData.modelIndex);
            }

            // Establecer los colores guardados
            if (initialModelData.colors) {
                setColors(prevColors => ({
                    ...prevColors,
                    ...initialModelData.colors
                }));
            }
        }
    }, [initialModelData]);

    // Selección automática cuando solo hay una parte modificable
    React.useEffect(() => {
        const currentColorParts = getCurrentColorParts();
        const colorPartKeys = Object.keys(currentColorParts);
        
        // Si solo hay una parte modificable, seleccionarla automáticamente
        if (colorPartKeys.length === 1 && !selectedPart) {
            setSelectedPart(colorPartKeys[0]);
        }
        // Si hay más de una parte y ninguna está seleccionada, limpiar la selección
        else if (colorPartKeys.length > 1 && selectedPart && !colorPartKeys.includes(selectedPart)) {
            setSelectedPart(null);
        }
    }, [selectedCollar, selectedPart]);

    const getCurrentModel = () => {
        return modelos[selectedCollar];
    };

    const getCurrentColorParts = () => {
        const currentModel = getCurrentModel();
        return currentModel?.color || {};
    };

    const handleColorSelect = (colorData) => {
        if (selectedPart) {
            setColors(prevColors => ({
                ...prevColors,
                [selectedPart]: colorData.color // Usar el color RGB del API
            }));
        }
    };

    const handlePartClick = (colorId) => {
        setSelectedPart(colorId);
    };

    const handleSVGClick = (e) => {
        // Only clear selection if clicking on the SVG background (not on color parts)
        if (e.target.tagName === 'svg') {
            setSelectedPart(null);
        }
    };

    const renderSVGElement = (element, color = null, isSelected = false, isClickable = false, isPolyline = false, isLine = false) => {
        const strokeProps = {
            stroke: isSelected ? "white" : "rgba(255,255,255,0.3)",
            strokeWidth: isSelected ? "4" : "1"
        };

        const style = {
            pointerEvents: isClickable ? 'auto' : 'none',
            filter: isSelected ? 'drop-shadow(0 0 8px rgba(255,255,255,0.8))' : 'none',
            transition: 'all 0.2s ease',
            cursor: isClickable ? 'pointer' : 'default'
        };

        // Common props that apply to all elements
        const commonProps = {
            ...(element.transform ? { transform: element.transform } : {}),
            ...(element.class ? { className: element.class } : {}),
            style
        };

        // Convert color if it's in RGB format
        const fillColor = color ? getRgbColor(color) : "currentColor";

        if (element.d) {
            // It's a path
            return (
                <path
                    fill={fillColor}
                    d={element.d}
                    {...(color ? strokeProps : {})}
                    {...commonProps}
                />
            );
        } else if (element.x1 !== undefined && element.y1 !== undefined && element.x2 !== undefined && element.y2 !== undefined) {
            // It's a line - always use black color like polylines
            return (
                <line
                    x1={element.x1}
                    y1={element.y1}
                    x2={element.x2}
                    y2={element.y2}
                    stroke={isSelected ? "white" : "#000000"}
                    strokeWidth={element.strokeWidth || (isSelected ? "4" : "2")}
                    strokeLinecap={element.strokeLinecap || "round"}
                    {...(isSelected ? { filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.8))' } : {})}
                    {...commonProps}
                />
            );
        } else if (element.points) {
            if (isPolyline) {
                // It's a polyline - always use black color
                return (
                    <polyline
                        fill="none"
                        stroke={isSelected ? "white" : "#000000"}
                        points={element.points}
                        strokeWidth={element.strokeWidth || (isSelected ? "4" : "2")}
                        strokeLinecap={element.strokeLinecap || "round"}
                        strokeLinejoin={element.strokeLinejoin || "round"}
                        {...(isSelected ? { filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.8))' } : {})}
                        {...commonProps}
                    />
                );
            } else {
                // It's a polygon
                return (
                    <polygon
                        fill={fillColor}
                        points={element.points}
                        {...(color ? strokeProps : {})}
                        {...commonProps}
                    />
                );
            }
        } else if (element.x !== undefined && element.y !== undefined && element.width !== undefined && element.height !== undefined) {
            // It's a rectangle
            return (
                <rect
                    fill={fillColor}
                    x={element.x}
                    y={element.y}
                    width={element.width}
                    height={element.height}
                    rx={element.rx || 0}
                    ry={element.ry || 0}
                    {...(color ? strokeProps : {})}
                    {...commonProps}
                />
            );
        } else if (element.cx !== undefined && element.cy !== undefined && element.r !== undefined) {
            // It's a circle
            return (
                <circle
                    fill={fillColor}
                    cx={element.cx}
                    cy={element.cy}
                    r={element.r}
                    {...(color ? strokeProps : {})}
                    {...commonProps}
                />
            );
        }
        return null;
    };

    const renderColorGroup = (colorId, colorGroup, color) => {
        const isSelected = selectedPart === colorId;
        const elements = [];

        // Render paths
        if (colorGroup.paths) {
            colorGroup.paths.forEach((path, index) => {
                elements.push(
                    <g key={`${colorId}-path-${index}`}>
                        {renderSVGElement(path, color, isSelected, true)}
                    </g>
                );
            });
        }

        // Render polygons
        if (colorGroup.polygons) {
            colorGroup.polygons.forEach((polygon, index) => {
                elements.push(
                    <g key={`${colorId}-polygon-${index}`}>
                        {renderSVGElement(polygon, color, isSelected, true)}
                    </g>
                );
            });
        }

        // Render polylines
        if (colorGroup.polylines) {
            colorGroup.polylines.forEach((polyline, index) => {
                elements.push(
                    <g key={`${colorId}-polyline-${index}`}>
                        {renderSVGElement(polyline, color, isSelected, true, true)}
                    </g>
                );
            });
        }

        // Render lines
        if (colorGroup.lines) {
            colorGroup.lines.forEach((line, index) => {
                elements.push(
                    <g key={`${colorId}-line-${index}`}>
                        {renderSVGElement(line, color, isSelected, true, false, true)}
                    </g>
                );
            });
        }

        // Render rectangles
        if (colorGroup.rects) {
            colorGroup.rects.forEach((rect, index) => {
                elements.push(
                    <g key={`${colorId}-rect-${index}`}>
                        {renderSVGElement(rect, color, isSelected, true)}
                    </g>
                );
            });
        }

        // Render circles
        if (colorGroup.circles) {
            colorGroup.circles.forEach((circle, index) => {
                elements.push(
                    <g key={`${colorId}-circle-${index}`}>
                        {renderSVGElement(circle, color, isSelected, true)}
                    </g>
                );
            });
        }

        return (
            <g
                key={colorId}
                onClick={(e) => {
                    e.stopPropagation();
                    handlePartClick(colorId);
                }}
                style={{
                    cursor: 'pointer',
                    pointerEvents: 'auto'
                }}
            >
                {elements}
            </g>
        );
    };

    const renderFondoElements = (fondo) => {
        const elements = [];

        Object.entries(fondo).forEach(([key, fondoGroup]) => {
            if (fondoGroup.paths) {
                fondoGroup.paths.forEach((path, index) => {
                    elements.push(
                        <g key={`fondo-${key}-path-${index}`}>
                            {renderSVGElement(path, null, false, false)}
                        </g>
                    );
                });
            }
            if (fondoGroup.polygons) {
                fondoGroup.polygons.forEach((polygon, index) => {
                    elements.push(
                        <g key={`fondo-${key}-polygon-${index}`}>
                            {renderSVGElement(polygon, null, false, false)}
                        </g>
                    );
                });
            }
            if (fondoGroup.polylines) {
                fondoGroup.polylines.forEach((polyline, index) => {
                    elements.push(
                        <g key={`fondo-${key}-polyline-${index}`}>
                            {renderSVGElement(polyline, null, false, false, true)}
                        </g>
                    );
                });
            }
            if (fondoGroup.lines) {
                fondoGroup.lines.forEach((line, index) => {
                    elements.push(
                        <g key={`fondo-${key}-line-${index}`}>
                            {renderSVGElement(line, null, false, false, false, true)}
                        </g>
                    );
                });
            }
            if (fondoGroup.rects) {
                fondoGroup.rects.forEach((rect, index) => {
                    elements.push(
                        <g key={`fondo-${key}-rect-${index}`}>
                            {renderSVGElement(rect, null, false, false)}
                        </g>
                    );
                });
            }
            if (fondoGroup.circles) {
                fondoGroup.circles.forEach((circle, index) => {
                    elements.push(
                        <g key={`fondo-${key}-circle-${index}`}>
                            {renderSVGElement(circle, null, false, false)}
                        </g>
                    );
                });
            }
        });

        return elements;
    };

    // Get current model and its color parts
    const currentModel = getCurrentModel();
    const currentColorParts = getCurrentColorParts();

    return (
        <VStack spacing={2} align="stretch" p={4}>
            {/* Collar Selection */}
            {showModelButtons && (
                <Center w="100%" mb={2}>
                    <Box
                        maxH="150px"
                        overflowY="auto"
                        p={2}
                        sx={{
                            scrollbarWidth: "thin",
                            scrollbarColor: "#666 #222",
                            '&::-webkit-scrollbar': {
                                width: '6px',
                            },
                            '&::-webkit-scrollbar-track': {
                                background: '#222',
                                borderRadius: '3px',
                            },
                            '&::-webkit-scrollbar-thumb': {
                                background: '#666',
                                borderRadius: '3px',
                            },
                        }}
                    >
                        <Flex wrap="wrap" gap={2} justify="center" maxW="600px">
                            {modelos.map((modelo, index) => (
                                <Button
                                    key={index}
                                    size="sm"
                                    colorScheme={selectedCollar === index ? 'blue' : 'gray'}
                                    onClick={() => setSelectedCollar(index)}
                                    color="orange"
                                    minW="80px"
                                    style={selectedCollar === index ? { backgroundColor: '#2b6cb0', color: 'white' } : {}}
                                >
                                    Modelo {index + 1}
                                </Button>
                            ))}
                        </Flex>
                    </Box>
                </Center>
            )}

            <Center w="100%" mb={2}>
                <Box
                    width={["400px", "550px"]}
                    height={["500px", "650px"]}
                    position="relative"
                    border="1px solid #333"
                    borderRadius="md"
                    overflow="hidden"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="100%"
                        height="100%"
                        viewBox="0 0 1080 1200"
                        preserveAspectRatio="xMidYMid meet"
                        onClick={handleSVGClick}
                        style={{
                            touchAction: 'manipulation',
                            userSelect: 'none'
                        }}
                    >
                        {/* Render fondo (background) elements first */}
                        {currentModel?.fondo && renderFondoElements(currentModel.fondo)}

                        {/* Render customizable color parts */}
                        {Object.entries(currentColorParts).map(([colorId, colorGroup]) => {
                            const color = colors[colorId] || '#FF0000'; // Fallback color
                            return renderColorGroup(colorId, colorGroup, color);
                        })}
                    </svg>
                </Box>
            </Center>

            {/* Current Selection Status - Solo mostrar si es modo selección */}
            {onModelSelect && (
                <>
                    <Center w="100%" mb={2}>
                        <Text color="white" fontSize={fontSize} textAlign="center">
                            {selectedPart ? (
                                <React.Fragment>
                                    Parte selecionada : {selectedPart.replace('color', '')}
                                    {/*(Modelo {selectedCollar + 1})*/}
                                    <Box
                                        as="span"
                                        display="inline-block"
                                        w="15px"
                                        h="15px"
                                        ml={2}
                                        borderRadius="sm"
                                        backgroundColor={getRgbColor(colors[selectedPart])}
                                        border="1px solid white"
                                    />
                                </React.Fragment>
                            ) : (
                                'Click on a color part to select it'
                            )}
                        </Text>
                    </Center>

                    {/* Alternative: Part selection buttons for mobile */}
                    <Box display={["block", "block", "none"]} mb={2}>
                        <Text color="white" fontSize={fontSize} mb={1}>
                            Selecciona una parte para colorear:
                        </Text>
                        <Flex wrap="wrap" gap={2} justify="center">
                            {Object.keys(currentColorParts).map((colorId) => (
                                <Box
                                    key={colorId}
                                    onClick={() => setSelectedPart(colorId)}
                                    cursor="pointer"
                                    px={3}
                                    py={2}
                                    borderRadius="md"
                                    backgroundColor={getRgbColor(colors[colorId])}
                                    border={selectedPart === colorId ? "2px solid white" : "2px solid transparent"}
                                    color={selectedPart === colorId ? "white" : "black"}
                                    fontSize="sm"
                                    fontWeight="bold"
                                    minW="60px"
                                    textAlign="center"
                                    _hover={{
                                        opacity: 0.8
                                    }}
                                >
                                    {colorId.replace('color', 'Parte ')}
                                </Box>
                            ))}
                        </Flex>
                    </Box>

                    <Text color="white" fontSize={fontSize} flexShrink={0}>
                        Colores Disponibles:
                    </Text>

                    <Box
                        overflowY="auto"
                        flexGrow={1}
                        maxH={["250px", "300px", "400px"]}
                        mb={2}
                        p={2}
                        border="1px solid #333"
                        borderRadius="md"
                        sx={{
                            scrollbarWidth: "thin",
                            scrollbarColor: "#666 #222",
                            '&::-webkit-scrollbar': {
                                width: '10px',
                            },
                            '&::-webkit-scrollbar-track': {
                                background: '#222',
                                borderRadius: '4px',
                            },
                            '&::-webkit-scrollbar-thumb': {
                                background: '#666',
                                borderRadius: '4px',
                                border: '2px solid #222',
                            },
                            '&::-webkit-scrollbar-thumb:hover': {
                                background: '#888',
                            },
                            WebkitOverflowScrolling: 'touch',
                        }}
                    >
                        {loading ? (
                            <Text color="white" textAlign="center" py={2} fontSize={fontSize}>Cargando colores...</Text>
                        ) : snap.modelColorsData.length === 0 ? (
                            <Text color="white" textAlign="center" py={2} fontSize={fontSize}>No hay colores disponibles</Text>
                        ) : (
                            <Flex
                                wrap="wrap"
                                justify="center"
                                gap={[2, 3]}
                                px={[0, 1]}
                            >
                                {snap.modelColorsData.map((colorData, index) => (
                                    <Box
                                        key={index}
                                        onClick={() => handleColorSelect(colorData)}
                                        cursor="pointer"
                                        borderRadius="md"
                                        p={2}
                                        mb={2}
                                        border={selectedPart && colors[selectedPart] === colorData.color
                                            ? "2px solid white"
                                            : "2px solid transparent"}
                                        minW={["50px", "60px"]}
                                    >
                                        <Box
                                            width={["45px", "50px"]}
                                            height={["45px", "50px"]}
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
                                            maxW={colorBoxSize}
                                        >
                                            {colorData.code}
                                        </Text>
                                    </Box>
                                ))}
                            </Flex>
                        )}
                    </Box>
                </>
            )}

            {/* Botón de Confirmación de Selección de Modelo */}
            {onModelSelect && (
                <Center w="100%" mt={4}>
                    <Button
                        size="lg"
                        bg="green.500"
                        color="white"
                        _hover={{ bg: "green.600" }}
                        _active={{ bg: "green.700" }}
                        onClick={() => {
                            const currentModel = getCurrentModel();
                            onModelSelect({
                                selectedCollar: selectedCollar,
                                colors: colors,
                                model: currentModel
                            });
                        }}
                        px={8}
                        py={3}
                    >
                        Confirmar Selección del Modelo {selectedCollar + 1}
                    </Button>
                </Center>
            )}
        </VStack>
    );
}

export default ClothingModelSelector;