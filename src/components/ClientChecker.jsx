import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Button, VStack, Text, Flex } from "@chakra-ui/react";
import axiosInstance from "../axiosConfig";
import { useSnapshot } from "valtio";
import {state} from "../store";

// eslint-disable-next-line react/prop-types
const ClientChecker = () => {
    const navigate = useNavigate();
    const snap = useSnapshot(state);
    const [cc, setCC] = useState("");
    const [error, setError] = useState("");

    const checkCliente = async () => {
        if (!cc) {
            setError("Ingrese una cédula válida.");
            return;
        }
        setError("");
        try {
            const response = await axiosInstance.get(`/clientes/check/${cc}/`);

            if (response.data.exists) {
                state.registered=true;
                state.clientData = response.data.cliente;
                state.showForm = false;
                state.showProductForm = true;
                navigate("/control-panel/product");

            } else {
                setError("Cliente no encontrado. Complete el formulario.");
                state.registered = false;
            }
        } catch (error) {
            setError("Error al verificar el cliente. Intente nuevamente.");
        }
    };

    return (
        <Flex direction="column" align="center">
            <VStack spacing={4} align="stretch">
                <Text fontSize="xl" fontWeight="bold" color="white" textAlign="center">
                    Verificar Cliente
                </Text>

                <Input
                    placeholder="Ingrese la cédula"
                    bg="gray.700"
                    color="white"
                    borderColor="yellow.400"
                    value={cc}
                    p={2}
                    onChange={(e) => {
                        setCC(e.target.value);
                        state.cc = e.target.value;
                    }}
                />

                <Button
                    bg={snap.color}
                    onClick={checkCliente}
                    color="black"
                    colorScheme="yellow"
                    width="full">
                    Buscar Cliente
                </Button>

                {error && <Text color="red.400">{error}</Text>}
            </VStack>
        </Flex>
    );
};

export default ClientChecker;
