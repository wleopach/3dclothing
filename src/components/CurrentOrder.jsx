import { state } from "../store";
import { useSnapshot } from "valtio";
import { Card, Text} from "@chakra-ui/react";
import CurrentProduct  from "./CurrentProduct";
const CurrentOrder = () => {
    const snap = useSnapshot(state);

    return (
        <Card.Root width="320px">
            <Card.Body gap="2">
                <Text fontWeight="semibold" textStyle="sm">
                    Cliente : {snap.clientData?.name || "Sin cliente"}
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
