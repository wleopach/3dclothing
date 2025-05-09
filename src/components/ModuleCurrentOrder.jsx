import { Box, Container } from "@chakra-ui/react";
import { Outlet, useNavigate } from "react-router-dom";
import { useSnapshot } from "valtio";
import { state } from "../store";
import CurrentOrder from "./CurrentOrder";
import Nav from './Nav';

function ModuleCurrentOrder() {
    const snap = useSnapshot(state);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    return (
        <Box minH="100vh" bg="black">
            <Container minW="90vw" p={0}>
                <Nav/>
                <Container minW="90vw" display="flex" gap={4} mt={10}>
                    <Box flex="0 0 320px" pt={10}>
                        <CurrentOrder />
                    </Box>
                    <Box flex="1" px={10}>
                        <Outlet />
                    </Box>
                </Container>
            </Container>
        </Box>
    );
}

export default ModuleCurrentOrder;
