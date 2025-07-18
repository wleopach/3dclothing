import { state } from "../store";
import { useSnapshot } from "valtio";
import { Card, Text} from "@chakra-ui/react";
import CurrentProduct  from "./CurrentProduct";
const CurrentOrder = () => {
    const snap = useSnapshot(state);

    return (
        <Card.Root width="320px" bg="gray.900">
            <Card.Body gap="2">
                <Text fontWeight="semibold" textStyle="xl" textAlign="center" color="#EFBD48">
                    Datos de la orden Actual
                </Text>
                <Text fontWeight="semibold" textStyle="sm" color="white">
                    <Text as="span" fontWeight="semibold" textStyle="sm" color="#EFBD48">Cliente : </Text>
                    {snap.clientData?.name || "Sin cliente"}
                </Text>
                <CurrentProduct
                    productName={snap.currentOrder.productName}
                    fabricName ={snap.currentOrder.fabricName}
                    colorSelected = {snap.currentOrder.colorSelected}
                    codeSelected = {snap.currentOrder.codeSelected}
                    sex = {snap.currentOrder.sex}
                    size = {snap.currentOrder.size}
                    quantity = {snap.currentOrder.quantity}
                />
            </Card.Body>
        </Card.Root>
    );
};

export default CurrentOrder;
