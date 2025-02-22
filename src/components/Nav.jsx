import { HStack, Image, Button, useBreakpointValue, IconButton } from "@chakra-ui/react";
import { useSnapshot } from "valtio";
import state from "../store"; // Import Valtio state
import logo from "../assets/images/logo.png";
import { MenuContent, MenuItem, MenuRoot, MenuTrigger } from "../components/ui/menu";
import { LuSearch } from "react-icons/lu"
export default function Nav() {
    const snap = useSnapshot(state);
    const isDesktop = useBreakpointValue({ base: false, lg: true });
    console.log("Descktop", isDesktop);
    if (!snap.cart.length > 0) return null;
    return (
        <nav>
            <HStack
                justify="space-between"
                padding="4rem 4rem"
                backgroundColor="black"
                height="50px"
            >
                <Image src={logo} alt="Company Logo" boxSize="100px" objectFit="contain" />

                {/* Desktop Menu */}
                {isDesktop ? (
                    <HStack as="ul" spacing="20px" className="nav">

                        {/* Buttons for state switching */}

                        <Button
                            colorScheme="teal"
                            size="sm"
                            onClick={() => {
                                state.showProductForm = true;
                                state.pickSize = false;
                                state.showCart = false;
                            }}
                        >
                            Select Product
                        </Button>


                        <Button
                            colorScheme="purple"
                            size="sm"
                            onClick={() => {
                                state.pickSize = true;
                                state.showProductForm = false;
                                state.showCart = false;
                            }}
                        >
                            Pick Size
                        </Button>

                            <Button
                                colorScheme="blue"
                                size="sm"
                                onClick={() => {
                                    state.showCart = true;
                                    state.pickSize = false;
                                    state.showProductForm = false;
                                }}
                            >
                                Mostrar Carrito
                            </Button>

                    </HStack>
                ) : (
                    // Mobile Menu
                    <HStack as="ul" spacing="20px" className="nav">
                        <MenuRoot>
                            <MenuTrigger asChild>
                                <IconButton variant="outline" size="sm">
                                    <LuSearch />
                                </IconButton>
                            </MenuTrigger>
                            <MenuContent>

                                {/* Mobile state-switching buttons */}

                                <MenuItem
                                    onClick={() => {
                                        state.showProductForm = true;
                                        state.pickSize = false;
                                        state.showCart = false;
                                    }}
                                >
                                    Select Product
                                </MenuItem>


                                <MenuItem
                                    onClick={() => {
                                        state.pickSize = true;
                                        state.showProductForm = false;
                                        state.showCart = false;
                                    }}
                                >
                                    Pick Size
                                </MenuItem>



                                    <MenuItem
                                        onClick={() => {
                                            state.showCart = true;
                                            state.pickSize = false;
                                            state.showProductForm = false;
                                        }}
                                    >
                                        Mostrar Carrito
                                    </MenuItem>

                            </MenuContent>
                        </MenuRoot>
                    </HStack>
                )}
            </HStack>
        </nav>
    );
}
