import { Button, Input, VStack, Box, Flex, Text } from "@chakra-ui/react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useSnapshot } from "valtio";
import {state} from "../store";

const ClientInfoForm = () => {
    const snap = useSnapshot(state);

    return (
        <Flex minH="100vh" align="center" justify="center" bg="black" p={4}>
            <Box
                w={{ base: "90%", md: "50%", lg: "40%" }} // Responsive width
                bg="black"
                p={6}
                borderRadius="lg"
                boxShadow="2xl"
            >
                <Formik
                    initialValues={{ name: "", email: "", phone: "", orderDetails: "" }}
                    validationSchema={Yup.object({
                        name: Yup.string().required("Required"),
                        email: Yup.string().email("Invalid email").required("Required"),
                        phone: Yup.string()
                            .matches(/^\d{10}$/, "Phone must be 10 digits")
                            .required("Required"),
                        orderDetails: Yup.string().required("Required"),
                    })}
                    onSubmit={(values, { setSubmitting }) => {
                        console.log("Order Submitted", values);

                        // Update the state correctly
                        state.clientData = values
                        state.currentOrder.client_email = values.email
                        console.log("current_order",state.currentOrder);
                        state.showForm = false;
                        state.showProductForm = true

                        setSubmitting(false);
                    }}
                >
                    {({ isSubmitting }) => (
                        <Form>
                            <VStack spacing={4} align="stretch">
                                <Text fontSize="xl" fontWeight="bold" color={snap.color} textAlign="center">
                                    Ingresar datos del cliente
                                </Text>

                                <label htmlFor="name">
                                    <Text color={snap.color}>Nombre</Text>
                                </label>
                                <Field as={Input} name="name" bg="gray.700" color="white" borderColor={snap.color} />
                                <ErrorMessage name="name" component="div" style={{ color: "red" }} />

                                <label htmlFor="email">
                                    <Text color={snap.color}>Email</Text>
                                </label>
                                <Field as={Input} name="email" type="email" bg="gray.700" color="white" borderColor={snap.color} />
                                <ErrorMessage name="email" component="div" style={{ color: "red" }} />

                                <label htmlFor="phone">
                                    <Text color={snap.color}>Número telefónico</Text>
                                </label>
                                <Field as={Input} name="phone" bg="gray.700" color="white" borderColor={snap.color} />
                                <ErrorMessage name="phone" component="div" style={{ color: "red" }} />

                                <label htmlFor="orderDetails">
                                    <Text color={snap.color}>Descripción de la órden</Text>
                                </label>
                                <Field as={Input} name="orderDetails" bg="gray.700" color="white" borderColor={snap.color} />
                                <ErrorMessage name="orderDetails" component="div" style={{ color: "red" }} />

                                <Button type="submit" bg={snap.color} color="black !important"  colorScheme="yellow" isLoading={isSubmitting} width="full">
                                    Inciar órden
                                </Button>
                            </VStack>
                        </Form>
                    )}
                </Formik>
            </Box>
        </Flex>
    );
};

export default ClientInfoForm;
