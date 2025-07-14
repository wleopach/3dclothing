import { Box, Container, useBreakpointValue } from "@chakra-ui/react";
import { Outlet, useNavigate } from "react-router-dom";
import { useSnapshot } from "valtio";
import { state } from "../store";
import CurrentOrder from "./CurrentOrder";
import Nav from './Nav';

function ModuleCurrentOrder() {
    const snap = useSnapshot(state);
    const navigate = useNavigate();

    // Responsive values
    const containerWidth = useBreakpointValue({
        base: "100vw",
        sm: "95vw",
        md: "90vw",
        lg: "85vw"
    });

    const sidebarWidth = useBreakpointValue({
        base: "100%",
        sm: "100%",
        md: "320px"
    });

    const mainContentPadding = useBreakpointValue({
        base: 2,
        sm: 4,
        md: 6,
        lg: 10
    });

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    return (
        <Box minH="100vh" bg="black">
            <Container maxW={containerWidth} p={0}>
                <Nav/>
                <Container
                    maxW={containerWidth} 
                    display="flex" 
                    flexDirection={{ base: "column", md: "row" }}
                    gap={4} 
                    mt={{ base: 4, md: 10 }}
                >
                    <Box
                        flex={{ base: "1", md: "0 0 auto" }}
                        width={sidebarWidth}
                        pt={{ base: 4, md: 10 }}
                    >
                        <CurrentOrder />
                    </Box>
                    <Box
                        flex="1" 
                        px={mainContentPadding}
                        width={{ base: "100%", md: "auto" }}
                    >
                        <Outlet />
                    </Box>
                </Container>
            </Container>
        </Box>
    );
}

export default ModuleCurrentOrder;
