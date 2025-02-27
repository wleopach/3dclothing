import { state } from "../store";
import { useSnapshot } from "valtio";
import { Card, Text, HStack, Box } from "@chakra-ui/react";

const CurrentOrder = () => {
    const snap = useSnapshot(state);

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

    return (
        <Card.Root width="320px">
            <Card.Body gap="2">
                <Text fontWeight="semibold" textStyle="sm">
                    Cliente : {snap.clientData?.name || "Sin cliente"}
                </Text>
                <HStack spacing={2}>
                    {snap.currentOrder.productName && (
                        <Text fontWeight="semibold" textStyle="sm">
                            Prenda: {snap.currentOrder.productName}.
                        </Text>
                    )}
                    {snap.currentOrder.fabricName && (
                        <Text fontWeight="semibold" textStyle="sm">
                            Stock: {snap.currentOrder.fabricName}
                        </Text>
                    )}
                </HStack>
                {snap.currentOrder.codeSelected && (
                    <HStack spacing={2}>
                        <Text>Color seleccionado: {snap.currentOrder.codeSelected}</Text>
                        <Box
                            width="20px"
                            height="20px"
                            borderRadius="md"
                            backgroundColor={getRgbColor(snap.currentOrder.colorSelected)}
                            margin="0 auto"
                            mt={1}
                            border="2px solid white"
                        />
                    </HStack>
                )}
                {snap.currentOrder.sex && (
                    <HStack spacing={2}>
                        <Text> Sexo: {snap.currentOrder.sex}</Text>
                        <Text >Talla: {snap.currentOrder.size}</Text>
                        <Text >Cantidad: {snap.currentOrder.quantity}</Text>
                    </HStack>
                )}
            </Card.Body>
        </Card.Root>
    );
};

export default CurrentOrder;
