import ClientChecker from "./ClientChecker";
import ClientForm from "./ClientForm";
import { Flex } from "@chakra-ui/react";
import { useSnapshot } from "valtio";
import {state} from "../store";

const ClientPage = () => {
    const snap = useSnapshot(state);

    return (
        <Flex align="center" justify="center" bg="black">
            {snap.registered ? (
                <ClientChecker />
            ) : (
                <ClientForm />
            )}
        </Flex>
    );
};

export default ClientPage;