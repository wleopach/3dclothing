import { Button, Input, VStack, Box, Flex, Text } from "@chakra-ui/react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useState } from "react";
import * as Yup from "yup";
import { useSnapshot } from "valtio";
import state from "../store";
import axiosInstance from "./../axiosConfig";

const LoginForm = () => {
    const snap = useSnapshot(state);
    const [eMessage, setEMessage] = useState(""); // Store login error message

    const handleLogin = async (values, { setSubmitting }) => {
        setEMessage(""); // Reset error message before login attempt

        try {
            console.log(values);
            const res = await axiosInstance.post("/login", {
                email: values.email,
                password: values.password,
            });

            const userData = res.data; // Get user data from response
            state.currentOrder.user_id = userData.id;
            console.log("current_order",state.currentOrder);
            state.userEmail = values.email;
            state.user = userData;
            state.isUnLogged=false;
            state.showForm = true;
            localStorage.setItem("token", userData.access); // Store token in localStorage
        } catch (err) {
            console.error("Login failed:", err.response ? err.response.data : err.message);
            setEMessage("Email o contraseña no son válidos.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Flex minH="100vh" align="center" justify="center" bg="black" p={4}>
            <Box
                w={{ base: "90%", md: "50%", lg: "30%" }}
                bg="black"
                p={6}
                borderRadius="lg"
                boxShadow="2xl"
            >
                <Formik
                    initialValues={{ email: "", password: "" }}
                    validationSchema={Yup.object({
                        email: Yup.string().email("Invalid email").required("Required"),
                        password: Yup.string()
                            .min(6, "Password must be at least 6 characters")
                            .required("Required"),
                    })}
                    onSubmit={handleLogin} // Corrected submission
                >
                    {({ isSubmitting }) => (
                        <Form>
                            <VStack spacing={4} align="stretch">
                                <Text fontSize="xl" fontWeight="bold" color={snap.color} textAlign="center">
                                    Iniciar Sesión
                                </Text>

                                <label htmlFor="email">
                                    <Text color={snap.color}>Email</Text>
                                </label>
                                <Field as={Input} name="email" type="email" bg="gray.700" color="white" borderColor={snap.color} />
                                <ErrorMessage name="email" component="div" style={{ color: "red" }} />

                                <label htmlFor="password">
                                    <Text color={snap.color}>Contraseña</Text>
                                </label>
                                <Field as={Input} name="password" type="password" bg="gray.700" color="white" borderColor={snap.color} />
                                <ErrorMessage name="password" component="div" style={{ color: "red" }} />

                                {eMessage && <Text color="red">{eMessage}</Text>}

                                <Button type="submit" bg={snap.color} color="black" colorScheme="yellow" isLoading={isSubmitting} width="full">
                                    Entrar
                                </Button>
                            </VStack>
                        </Form>
                    )}
                </Formik>
            </Box>
        </Flex>
    );
};

export default LoginForm;
