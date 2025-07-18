import {Box, HStack, Text, VStack} from "@chakra-ui/react";

function CurrentProduct({productName, cortadorName, fabricName, colorSelected, codeSelected, sex, size, quantity}) {
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
        <Box mb={[1, 2, 3]} color="white">
            <VStack spacing={[1, 2, 4]} align="start">
                {productName && (
                    <Text fontSize={["xs", "sm", "md"]} fontWeight="semibold">
                        <Text as="span" fontWeight="semibold" textStyle="sm" color="#EFBD48">Prenda: </Text> {productName}.
                    </Text>
                )}
                {cortadorName && (
                    <Text fontSize={["xs", "sm", "md"]} fontWeight="semibold">
                        <Text as="span" fontWeight="semibold" textStyle="sm" color="#EFBD48">Cortador: </Text> {cortadorName}
                    </Text>
                )}
                {fabricName && (
                    <Text fontSize={["xs", "sm", "md"]} fontWeight="semibold">
                        <Text as="span" fontWeight="semibold" textStyle="sm" color="#EFBD48">Stock: </Text> {fabricName}
                    </Text>
                )}
            </VStack>

            {codeSelected && (
                <HStack spacing={2} mt={[1]}>
                    <Text fontSize={["xs", "sm", "md"]} fontWeight="semibold">
                        <Text as="span" fontWeight="semibold" textStyle="sm" color="#EFBD48">Color seleccionado: </Text> {codeSelected}
                    </Text>
                    <Box
                        width="20px"
                        height="20px"
                        borderRadius="md"
                        backgroundColor={getRgbColor(colorSelected)}
                        margin="0 auto"
                        mt={1}
                        border="2px solid white"
                    />
                </HStack>
            )}

            {sex && (
                <HStack spacing={2}>
                    <Text fontSize={["xs", "sm", "md"]} fontWeight="semibold">
                        Sexo: {sex}</Text>
                    <Text fontSize={["xs", "sm", "md"]} fontWeight="semibold">
                        Talla: {size}</Text>
                    <Text fontSize={["xs", "sm", "md"]} fontWeight="semibold">
                        Cantidad: {quantity}</Text>
                </HStack>
            )}
        </Box>
    );
}

export default CurrentProduct;
