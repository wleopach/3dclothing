import { Box, Button, Text, Portal } from "@chakra-ui/react";
import {
    DialogRoot,
    DialogBackdrop,
    DialogContent,
    DialogHeader,
    DialogBody,
    DialogTitle
} from "@/components/ui/dialog.jsx";
import ClothingModelSelector from "./ClothingModelSelector.jsx";

const ModelSelectorDialog = ({
    isOpen,
    onClose,
    onModelSelect,
    initialModelData = null,
    title = "Seleccionar Modelo",
    showModelButtons = true,
    modelType = null,
    showUploadedImage = false
}) => {
    return (
        <DialogRoot open={isOpen} onOpenChange={(open) => {
            // Solo cerrar cuando realmente se quiera cerrar, no cuando se abra el lightbox
            if (!open) {
                onClose();
            }
        }}>
            <DialogContent
                width="100vw"
                height="100vh"
                maxWidth="100vw"
                maxHeight="100vh"
                margin={0}
                borderRadius={0}
                bg="black"
                p={0}
            >
                <DialogHeader
                    bg="gray.800"
                    borderBottom="1px solid"
                    borderColor="gray.700"
                    p={4}
                >
                    <DialogTitle color="white" fontSize="xl" fontWeight="bold">
                        {title}
                    </DialogTitle>
                    <Button
                        position="absolute"
                        top={4}
                        right={4}
                        size="sm"
                        bg="red.500"
                        color="white"
                        _hover={{ bg: "red.600" }}
                        onClick={onClose}
                    >
                        Cerrar Sin Guardar
                    </Button>
                </DialogHeader>
                <DialogBody p={0} height="calc(100vh - 80px)" overflow="hidden">
                    <Box height="100%" overflow="auto">
                        <ClothingModelSelector
                            onModelSelect={onModelSelect}
                            initialModelData={initialModelData}
                            showModelButtons={showModelButtons}
                            typoModelo={modelType}
                            showUploadedImage={showUploadedImage}
                        />
                    </Box>
                </DialogBody>
            </DialogContent>
        </DialogRoot>
    );
};

export default ModelSelectorDialog;