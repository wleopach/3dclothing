import {Box, HStack, Text} from "@chakra-ui/react";

function CurrentProduct({productName, fabricName, colorSelected, codeSelected, sex, size, quantity}) {
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
        <Box mb={[1, 2, 3]}>
            <HStack spacing={[1, 2, 4]} wrap="wrap">
                {productName && (
                    <Text fontSize={["xs", "sm", "md"]} fontWeight="semibold">

                        Prenda: {productName}.
                    </Text>
                )}
                {fabricName && (
                    <Text fontSize={["xs", "sm", "md"]} fontWeight="semibold">

                        Stock: {fabricName}
                    </Text>
                )}
            </HStack>

            {codeSelected && (
                <HStack spacing={2}>
                    <Text fontSize={["xs", "sm", "md"]} fontWeight="semibold">
                        Color seleccionado: {codeSelected}</Text>
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
