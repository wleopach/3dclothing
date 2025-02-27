import {state} from "../store";
import { useSnapshot } from "valtio";
import { Card, Text , HStack} from "@chakra-ui/react"

const CurrentOrder = () => {
    const snap = useSnapshot(state);
    return (
        <Card.Root width="320px">
            <Card.Body gap="2">
                <Text fontWeight="semibold" textStyle="sm">
                    Cliente : {snap.clientData.name}

                </Text>
                <HStack spacing={2}>
                    {state.productName ? (
                        <Text fontWeight="semibold" textStyle="sm">
                            Prenda : {snap.productName}.
                        </Text>
                    ): null
                    }
                    {state.fabricName ? (
                        <Text fontWeight="semibold" textStyle="sm">
                            Stock : {snap.fabricName}
                        </Text>
                    ): null
                    }
                </HStack>

            </Card.Body>
        </Card.Root>
    )
}
export default CurrentOrder
