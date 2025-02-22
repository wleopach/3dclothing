import { HStack, Image, Button, useBreakpointValue, IconButton } from "@chakra-ui/react";
import { useSnapshot } from "valtio";
import state from "../store"; // Import Valtio state
import logo from "../assets/images/logo.png";
import { MenuContent, MenuItem, MenuRoot, MenuTrigger } from "../components/ui/menu";
import { LuSearch } from "react-icons/lu";
import CustomButton from "./CustomButton";

export default function Nav() {
    const snap = useSnapshot(state);
    const isDesktop = useBreakpointValue({ base: false, lg: true });

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
                        <CustomButton
                            type="filled"
                            title="Prendas"
                            handleClick={() => {
                                state.showProductForm = true;
                                state.pickSize = false;
                                state.pickColor = false;
                                state.showCart = false;
                            }}
                            customeStyles="w-fit px-4 py-2.5 font-bold text-sm"
                        />

                        <CustomButton
                            type="filled"
                            title="Colores"
                            handleClick={() => {
                                state.pickSize = false;
                                state.showProductForm = false;
                                state.pickColor = true;
                                state.showCart = false;
                            }}
                            customeStyles="w-fit px-4 py-2.5 font-bold text-sm"
                        />

                        <CustomButton
                            type="filled"
                            title="Tallas"
                            handleClick={() => {
                                state.pickSize = true;
                                state.showProductForm = false;
                                state.pickColor = false;
                                state.showCart = false;
                            }}
                            customeStyles="w-fit px-4 py-2.5 font-bold text-sm"
                        />

                        <CustomButton
                            type="filled"
                            title="Carrito"
                            handleClick={() => {
                                state.showCart = true;
                                state.pickSize = false;
                                state.pickColor = false;
                                state.showProductForm = false;
                            }}
                            customeStyles="w-fit px-4 py-2.5 font-bold text-sm"
                        />
                    </HStack>
                ) : (
                    // Mobile Menu
                    <MenuRoot>
                        <MenuTrigger asChild>
                            <IconButton variant="outline" size="sm">
                                <LuSearch />
                            </IconButton>
                        </MenuTrigger>
                        <MenuContent>
                            <MenuItem
                                onClick={() => {
                                    state.showProductForm = true;
                                    state.pickSize = false;
                                    state.pickColor = false;
                                    state.showCart = false;
                                }}
                            >
                                Prendas
                            </MenuItem>

                            <MenuItem
                                onClick={() => {
                                    state.pickColor = true;
                                    state.showProductForm = false;
                                    state.pickSize = false;
                                    state.showCart = false;
                                }}
                            >
                                Colores
                            </MenuItem>

                            <MenuItem
                                onClick={() => {
                                    state.pickSize = true;
                                    state.showProductForm = false;
                                    state.pickColor = false;
                                    state.showCart = false;
                                }}
                            >
                                Tallas
                            </MenuItem>

                            <MenuItem
                                onClick={() => {
                                    state.showCart = true;
                                    state.pickSize = false;
                                    state.pickColor = false;
                                    state.showProductForm = false;
                                }}
                            >
                                Carrito
                            </MenuItem>
                        </MenuContent>
                    </MenuRoot>
                )}
            </HStack>
        </nav>
    );
}
