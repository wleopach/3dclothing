import './ClothingModelSelector.css';
import { Box, Text, Flex, VStack, Center, Button, Input } from "@chakra-ui/react";
import React from 'react'
import { useEffect, useCallback, useState } from 'react';
import {
    modelo3, modelo15, modelo6, modelo17, modelo10, modelo5,
    modelo18, modelo8, modelo9, pantalon6, modelo20, pantalon11,
    modelo12, modelo1, modelo7, modelo19, modelo2, pantalon10,
    pantalon9, pantalon1, pantalon7, modelo16, modelo14, pantalon4,
    modelo13, pantalon8, pantalon2, modelo4, pantalon5, modelo11, pantalon3
}
    from './collars/Collars';
import { useSnapshot } from "valtio";
import { state } from "../../store";
import axiosInstance from "../../axiosConfig";
import types from "./collars/TypeMap";

function ClothingModelSelector({ onModelSelect, initialModelData, typoModelo, showModelButtons = true, showUploadedImage = false }) {
    const snap = useSnapshot(state);
    const fontSize = "sm";
    const colorBoxSize = "50px";
    const fileInputRef = React.useRef(null);

    // Funciones para mostrar notificaciones
    const showSuccessNotification = (message) => {
        setSuccessMessage(message);
        setShowSuccessAlert(true);
        setShowErrorAlert(false);
    };

    const showErrorNotification = (message) => {
        setErrorMessage(message);
        setShowErrorAlert(true);
        setShowSuccessAlert(false);
    };

    // Array of all models for easy access
    let modelos = [
        modelo3, modelo15, modelo6, modelo17, modelo10, modelo5,
        modelo18, modelo8, modelo9, pantalon6, modelo20, pantalon11,
        modelo12, modelo1, modelo7, modelo19, modelo2, pantalon10,
        pantalon9, pantalon1, pantalon7, modelo16, modelo14, pantalon4,
        modelo13, pantalon8, pantalon2, modelo4, pantalon5, modelo11, pantalon3
    ];

    if (typoModelo) {
        modelos = types[typoModelo];
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
    const [selectedModelPhoto, setSelectedModelPhoto] = React.useState(null);
    const [photoFileName, setPhotoFileName] = React.useState('');
    const [personName, setPersonName] = React.useState('');
    const [personRole, setPersonRole] = React.useState('');
    const [lightboxOpen, setLightboxOpen] = React.useState(false);
    const [lightboxIndex, setLightboxIndex] = React.useState(0);
    const lightboxRef = React.useRef(null);

    // Estados para notificaciones
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [showErrorAlert, setShowErrorAlert] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    // Función para cerrar el lightbox (definida ANTES de los useEffect)
    const closeLightbox = useCallback(() => {
        console.log('=== FUNCIÓN closeLightbox EJECUTADA ===');
        console.log('Estado actual lightboxOpen:', lightboxOpen);
        console.log('Estado actual lightboxIndex:', lightboxIndex);

        setLightboxOpen(false);
        console.log('setLightboxOpen(false) ejecutado');

        // Restaurar el scroll del body
        document.body.style.overflow = 'auto';
        console.log('Scroll del body restaurado');

        console.log('=== FIN FUNCIÓN closeLightbox ===');
    }, [lightboxOpen, lightboxIndex]);

    // Función para abrir el lightbox de la imagen
    const openLightbox = useCallback((index = 0, event) => {
        // Prevenir que el evento se propague al diálogo padre
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        // Verificar que hay una imagen válida antes de abrir
        const hasValidImage = (showUploadedImage && initialModelData?.imageData) ||
                             (selectedModelPhoto && selectedModelPhoto instanceof File);

        if (hasValidImage) {
            console.log('Abriendo lightbox con imagen válida');
            setLightboxIndex(index);
            setLightboxOpen(true);
        } else {
            console.warn('No hay imagen válida para mostrar en el lightbox');
        }
    }, [showUploadedImage, initialModelData, selectedModelPhoto]);

    // Función de cierre alternativa para debugging
    const handleCloseLightbox = () => {
        console.log('handleCloseLightbox llamado');
        closeLightbox();
    };

    // Monitorear cambios en el estado del lightbox
    useEffect(() => {
        console.log('=== useEffect: Estado del lightbox cambió ===');
        console.log('lightboxOpen:', lightboxOpen);
        console.log('lightboxIndex:', lightboxIndex);
        console.log('=== FIN useEffect ===');
    }, [lightboxOpen, lightboxIndex]);

    // Prevenir que el estado se resetee accidentalmente
    useEffect(() => {
        if (lightboxOpen) {
            console.log('Lightbox abierto, previniendo cierre automático');
        }
    }, [lightboxOpen]);

    // Prevenir que el lightbox interfiera con el diálogo padre
    useEffect(() => {
        // Cuando el lightbox se abre, asegurar que no interfiera con el diálogo
        if (lightboxOpen) {
            // Agregar clase al body para prevenir scroll del diálogo
            document.body.style.overflow = 'hidden';

            return () => {
                // Restaurar cuando se cierre
                document.body.style.overflow = 'auto';
            };
        }
    }, [lightboxOpen]);

    // Prevenir que el lightbox se cierre cuando cambien las props
    useEffect(() => {
        // Si el lightbox está abierto, mantenerlo abierto
        if (lightboxOpen) {
            console.log('Props cambiaron pero lightbox sigue abierto');
        }
    }, [initialModelData, showUploadedImage, selectedModelPhoto]);

    // Manejar eventos de teclado globales para el lightbox
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (lightboxOpen && event.key === 'Escape') {
                console.log('ESC global detectado, cerrando lightbox');
                closeLightbox();
            }
        };

        if (lightboxOpen) {
            document.addEventListener('keydown', handleKeyDown);
            console.log('Event listener de teclado agregado');

            return () => {
                document.removeEventListener('keydown', handleKeyDown);
                console.log('Event listener de teclado removido');
            };
        }
    }, [lightboxOpen, closeLightbox]);

    // Efecto para ocultar la alerta de éxito después de 3 segundos
    useEffect(() => {
        if (showSuccessAlert) {
            const timer = setTimeout(() => {
                setShowSuccessAlert(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showSuccessAlert]);

    // Efecto para ocultar la alerta de error después de 5 segundos
    useEffect(() => {
        if (showErrorAlert) {
            const timer = setTimeout(() => {
                setShowErrorAlert(false);
                setErrorMessage("");
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [showErrorAlert]);

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

    // Validar archivo de imagen
    const validateImageFile = (file) => {
        // Validar tipo de archivo
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            showErrorNotification("Por favor selecciona una imagen (JPG, PNG, GIF, WEBP)");
            return false;
        }

        // Validar tamaño (10MB = 10 * 1024 * 1024 bytes)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            showErrorNotification("La imagen debe tener un tamaño máximo de 10MB");
            return false;
        }

        return true;
    };

    // Manejar carga de archivo
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file && validateImageFile(file)) {
            setSelectedModelPhoto(file);
            setPhotoFileName(file.name);
            showSuccessNotification(`Imagen cargada exitosamente: ${file.name}`);
        }
        // Limpiar el input para permitir cargar el mismo archivo nuevamente
        event.target.value = '';
    };

    // Función para abrir el selector de archivos
    const openFileSelector = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
            fileInputRef.current.click();
        }
    };

    const showLogoRequired = () => {
        const currentModel = getCurrentModel();
        return currentModel === modelo17;
    }

    // Verificar si se puede confirmar la selección
    const canConfirmSelection = () => {
        const currentModel = getCurrentModel();
        if (currentModel === modelo17) {
            // Para modelo17, la foto es obligatoria
            // if (!selectedModelPhoto) {
            //     return false;
            // }

            // Si se ha ingresado nombre o cargo, ambos deben estar completos
            // if ((personName && !personRole) || (!personName && personRole)) {
            //     return false;
            // }

            return true;
        }
        return true;
    };

    // Cargar colores del stock si no están en el store
    React.useEffect(() => {
        const fetchModelColors = async () => {
            // if (!snap.currentOrder.stock) return;

            // Si ya tenemos colores en el store y el stock no ha cambiado, no hacer la llamada
            // if (snap.modelColorsData.length > 0) return;

            setLoading(true);
            try {
                const response = await axiosInstance.get("/telas/by_parameter/");
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

            // Establecer la foto del modelo si existe
            if (initialModelData.selectedModelPhoto) {
                setSelectedModelPhoto(initialModelData.selectedModelPhoto);
                setPhotoFileName(initialModelData.photoFileName || '');
            }

            // Establecer los campos de texto del modelo17 si existen
            if (initialModelData.personName) {
                setPersonName(initialModelData.personName);
            }
            if (initialModelData.personRole) {
                setPersonRole(initialModelData.personRole);
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

    const handleConfirmSelection = async () => {
        if (!canConfirmSelection()) {
            showErrorNotification("Debes cargar una foto para este modelo antes de confirmar");
            return;
        }

        // Si hay una foto seleccionada, enviarla al servidor primero
        let imageData = null;
        if (selectedModelPhoto) {
            try {
                setLoading(true);

                const formData = new FormData();
                formData.append('image', selectedModelPhoto);

                const response = await axiosInstance.post('/images/upload/', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                if (response.data.success) {
                    imageData = response.data.image;
                    showSuccessNotification(`Imagen procesada exitosamente. Tamaño: ${response.data.file_info.size_mb.toFixed(2)}MB`);
                } else {
                    showErrorNotification("Error procesando la imagen");
                    return;
                }
            } catch (error) {
                console.error('Error subiendo imagen:', error);
                showErrorNotification("Error subiendo la imagen al servidor");
                return;
            } finally {
                setLoading(false);
            }
        }

        const currentModel = getCurrentModel();
        onModelSelect({
            selectedCollar: selectedCollar,
            colors: colors,
            model: currentModel,
            selectedModelPhoto: selectedModelPhoto,
            photoFileName: photoFileName,
            personName: personName,
            personRole: personRole,
            imageData: imageData // Incluir los datos de la imagen procesada
        });
    };

    return (
        <>
            {/* Alertas flotantes con posicionamiento absoluto */}
            {showSuccessAlert && (
                <Box
                    position="fixed"
                    top="20px"
                    left="50%"
                    transform="translateX(-50%)"
                    zIndex="9999"
                    bg="green.500"
                    color="white"
                    px={6}
                    py={4}
                    borderRadius="lg"
                    boxShadow="lg"
                    maxW="400px"
                    textAlign="center"
                >
                    <Text fontWeight="bold" fontSize="md">
                        ✅ {successMessage}
                    </Text>
                </Box>
            )}

            {showErrorAlert && (
                <Box
                    position="fixed"
                    top="20px"
                    left="50%"
                    transform="translateX(-50%)"
                    zIndex="9999"
                    bg="red.500"
                    color="white"
                    px={6}
                    py={4}
                    borderRadius="lg"
                    boxShadow="lg"
                    maxW="400px"
                    textAlign="center"
                >
                    <Text fontWeight="bold" fontSize="md">
                        ❌ {errorMessage}
                    </Text>
                </Box>
            )}

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

            {/* Foto requerida para este Modelo */}
            {(showLogoRequired() && onModelSelect) || (showUploadedImage && initialModelData?.imageData) ? (
                <Center w="100%" mb={4}>
                    <VStack spacing={3} p={4} border="2px dashed" borderColor={selectedModelPhoto ? "green.400" : "orange.400"} borderRadius="md" bg="rgba(0,0,0,0.1)">
                        <Text color="white" fontSize="md" fontWeight="bold" textAlign="center">
                            {showUploadedImage && initialModelData?.imageData ? "📸 Foto para el Modelo" : "📸 Foto (Opcional)"}
                        </Text>

                        {!selectedModelPhoto && !(showUploadedImage && initialModelData?.imageData) ? (
                            <Box>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    display="none"
                                    id="photo-upload"
                                    ref={fileInputRef}
                                />
                                <Button
                                    colorScheme="blue"
                                    size="md"
                                    cursor="pointer"
                                    _hover={{ bg: "blue.600" }}
                                    onClick={openFileSelector}
                                >
                                    📁 Seleccionar Foto
                                </Button>
                            </Box>
                        ) : (
                            <VStack spacing={2}>
                                <Text color="green.400" fontSize="sm" fontWeight="bold">
                                    {showUploadedImage && initialModelData?.imageData ? "" : `✅ Foto cargada: ${photoFileName}`}
                                </Text>

                                {/* Vista previa de la imagen */}
                                <Box
                                    position="relative"
                                    width="100%"
                                    height="150px"
                                    borderRadius="md"
                                    overflow="hidden"
                                    border="2px solid"
                                    borderColor="green.400"
                                    bg="gray.800"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    cursor={(() => {
                                        const hasValidImage = (showUploadedImage && initialModelData?.imageData) ||
                                                           (selectedModelPhoto && selectedModelPhoto instanceof File);
                                        return hasValidImage ? "pointer" : "default";
                                    })()}
                                    onClick={(event) => openLightbox(0, event)}
                                    _hover={(() => {
                                        const hasValidImage = (showUploadedImage && initialModelData?.imageData) ||
                                                           (selectedModelPhoto && selectedModelPhoto instanceof File);
                                        return hasValidImage ? {
                                            borderColor: "blue.400",
                                            transform: "scale(1.05)",
                                            transition: "all 0.2s"
                                        } : {};
                                    })()}
                                    title={(() => {
                                        const hasValidImage = (showUploadedImage && initialModelData?.imageData) ||
                                                           (selectedModelPhoto && selectedModelPhoto instanceof File);
                                        return hasValidImage ? "Click para ver en pantalla completa" : "No hay imagen para mostrar";
                                    })()}
                                >
                                    {showUploadedImage && initialModelData?.imageData ? (
                                        <img
                                            src={`${axiosInstance.defaults.baseURL}/images/${initialModelData.imageData.id}/?extension=${initialModelData.imageData.extension}`}
                                            alt="Foto del producto"
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                    ) : selectedModelPhoto && selectedModelPhoto instanceof File ? (
                                        <img
                                            src={URL.createObjectURL(selectedModelPhoto)}
                                            alt="Vista previa"
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                    ) : (
                                        <Text color="gray.400" fontSize="sm" textAlign="center">
                                            Sin imagen
                                        </Text>
                                    )}

                                    {/* Ícono de zoom - solo mostrar si hay imagen válida */}
                                    {(() => {
                                        const hasValidImage = (showUploadedImage && initialModelData?.imageData) ||
                                                           (selectedModelPhoto && selectedModelPhoto instanceof File);
                                        return hasValidImage ? (
                                            <Box
                                                position="absolute"
                                                top="5px"
                                                right="5px"
                                                bg="rgba(0,0,0,0.7)"
                                                color="white"
                                                borderRadius="full"
                                                width="24px"
                                                height="24px"
                                                display="flex"
                                                alignItems="center"
                                                justifyContent="center"
                                                fontSize="12px"
                                                fontWeight="bold"
                                            >
                                                🔍
                                            </Box>
                                        ) : null;
                                    })()}
                                </Box>

                                {/* Texto indicativo - solo mostrar si hay imagen válida */}
                                {(() => {
                                    const hasValidImage = (showUploadedImage && initialModelData?.imageData) ||
                                                       (selectedModelPhoto && selectedModelPhoto instanceof File);
                                    return hasValidImage ? (
                                        <Text color="blue.300" fontSize="xs" textAlign="center" fontStyle="italic">
                                            💡 Click en la imagen para ver en pantalla completa
                                        </Text>
                                    ) : null;
                                })()}

                                {!showUploadedImage && (
                                    <VStack spacing={2}>
                                        <Button
                                            size="md"
                                            colorScheme="red"
                                            bg="red.500"
                                            onClick={() => {
                                                setSelectedModelPhoto(null);
                                                setPhotoFileName('');
                                            }}
                                            _hover={{ bg: "red.600" }}
                                        >
                                            🗑️ Eliminar Foto
                                        </Button>
                                    </VStack>
                                )}
                            </VStack>
                        )}
                    </VStack>
                </Center>
            ) : ''}

            {/* Campos de texto opcionales para modelo17 */}
            {(showLogoRequired() && onModelSelect) || (showUploadedImage && (initialModelData?.personName || initialModelData?.personRole)) ? (
                <Center w="100%" mb={4}>
                    <VStack
                        spacing={3}
                        p={4}
                        border="2px dashed"
                        borderColor="blue.400"
                        borderRadius="md"
                        bg="rgba(0,0,0,0.1)"
                        width={["100%", "100%", "80%", "60%"]}
                        maxW="500px"
                    >
                        <Text color="white" fontSize="md" fontWeight="bold" textAlign="center">
                            📝 Información Adicional (Opcional)
                        </Text>
                        <Text color="white" fontSize="sm" textAlign="center">
                            {showUploadedImage ? "Datos para el Bordado" : "Puede agregar el nombre y cargo para el bordado"}
                        </Text>

                        <VStack spacing={3} width="100%">
                            <Box width="100%">
                                <Text color="white" fontSize="sm" mb={2}>
                                    Nombre de la persona:
                                </Text>
                                <Input
                                    placeholder="Ingrese el nombre de la persona"
                                    value={showUploadedImage ? (initialModelData?.personName || '') : (personName || '')}
                                    onChange={showUploadedImage ? undefined : (e) => setPersonName(e.target.value)}
                                    bg="gray.800"
                                    borderColor="gray.600"
                                    color="white"
                                    isReadOnly={showUploadedImage}
                                    _hover={{
                                        borderColor: showUploadedImage ? "gray.600" : "blue.400"
                                    }}
                                    _focus={{
                                        borderColor: showUploadedImage ? "gray.600" : "blue.400",
                                        boxShadow: showUploadedImage ? "none" : "0 0 0 1px #63B3ED"
                                    }}
                                />
                            </Box>

                            <Box width="100%">
                                <Text color="white" fontSize="sm" mb={2}>
                                    Cargo:
                                </Text>
                                <Input
                                    placeholder="Ingrese el cargo de la persona"
                                    value={showUploadedImage ? (initialModelData?.personRole || '') : (personRole || '')}
                                    onChange={showUploadedImage ? undefined : (e) => setPersonRole(e.target.value)}
                                    bg="gray.800"
                                    borderColor="gray.600"
                                    color="white"
                                    isReadOnly={showUploadedImage}
                                    _hover={{
                                        borderColor: showUploadedImage ? "gray.600" : "blue.400"
                                    }}
                                    _focus={{
                                        borderColor: showUploadedImage ? "gray.600" : "blue.400",
                                        boxShadow: showUploadedImage ? "none" : "0 0 0 1px #63B3ED"
                                    }}
                                />
                            </Box>
                        </VStack>
                    </VStack>
                </Center>
            ) : null}

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
                                'De click en una parte para seleccionarla'
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
            {!canConfirmSelection() ?
                <Center w="100%" mt={4}>
                    <Text color="red.500" fontSize={fontSize} textAlign="center">
                        Foto requerida
                    </Text>
                </Center>
                : ''}
            {onModelSelect && (
                <Center w="100%" mt={4}>
                    <Button
                        size="lg"
                        bg={canConfirmSelection() ? "green.500" : "gray.500"}
                        color="white"
                        _hover={{ bg: canConfirmSelection() ? "green.600" : "gray.600" }}
                        _active={{ bg: canConfirmSelection() ? "green.700" : "gray.700" }}
                        onClick={handleConfirmSelection}
                        px={8}
                        py={3}
                        disabled={!canConfirmSelection()}
                        title={!canConfirmSelection() ? "Debes cargar una foto para el modelo 17 antes de confirmar" : ""}
                    >
                        {canConfirmSelection()
                            ? `Confirmar Selección del Modelo ${selectedCollar + 1}`
                            : `Foto requerida para Modelo ${selectedCollar + 1}`
                        }
                    </Button>
                </Center>
            )}

            {/* Los botones de respaldo ya no son necesarios con el modal personalizado */}

            {/* Modal personalizado simple para previsualización en pantalla completa */}
            {lightboxOpen && (() => {
                const slides = [];

                // Agregar imagen del modelo si existe
                if (showUploadedImage && initialModelData?.imageData) {
                    slides.push({
                        src: `${axiosInstance.defaults.baseURL}/images/${initialModelData.imageData.id}/?extension=${initialModelData.imageData.extension}`,
                        alt: "Foto del producto"
                    });
                } else if (selectedModelPhoto && selectedModelPhoto instanceof File) {
                    try {
                        slides.push({
                            src: URL.createObjectURL(selectedModelPhoto),
                            alt: "Vista previa"
                        });
                    } catch (error) {
                        console.warn('Error creating object URL:', error);
                        // Si falla, no agregar la imagen
                    }
                }

                // Solo renderizar si hay slides
                if (slides.length === 0) {
                    return null;
                }

                return (
                    <Box
                        position="fixed"
                        top={0}
                        left={0}
                        right={0}
                        bottom={0}
                        bg="rgba(0,0,0,0.95)"
                        zIndex={9999}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        onClick={(e) => {
                            // Cerrar al hacer click en el fondo
                            if (e.target === e.currentTarget) {
                                closeLightbox();
                            }
                        }}
                    >
                        {/* Botón de cierre */}
                        <Box
                            position="absolute"
                            top="20px"
                            right="20px"
                            bg="red.500"
                            color="white"
                            borderRadius="full"
                            width="60px"
                            height="60px"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            cursor="pointer"
                            onClick={closeLightbox}
                            _hover={{
                                bg: "red.600",
                                transform: "scale(1.1)"
                            }}
                            fontSize="28px"
                            fontWeight="bold"
                            boxShadow="lg"
                            border="3px solid white"
                            zIndex={10000}
                        >
                            ✕
                        </Box>

                        {/* Imagen */}
                        <Box
                            maxW="90vw"
                            maxH="90vh"
                            position="relative"
                        >
                            <img
                                src={slides[0].src}
                                alt={slides[0].alt}
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '100%',
                                    objectFit: 'contain'
                                }}
                            />
                        </Box>

                        {/* Texto de ayuda */}
                        <Text
                            position="absolute"
                            bottom="20px"
                            left="50%"
                            transform="translateX(-50%)"
                            color="white"
                            fontSize="sm"
                            opacity={0.8}
                        >
                            Click en el fondo o en ✕ para cerrar
                        </Text>
                    </Box>
                );
            })()}
        </VStack>
        </>
    );
}

export default ClothingModelSelector;