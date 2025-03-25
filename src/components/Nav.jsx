import {HStack, Image, useBreakpointValue, IconButton} from "@chakra-ui/react";
import {useSnapshot} from "valtio";
import {state} from "../store"; // Import Valtio state
import logo from "../assets/images/logo.png";
// import {MenuContent, MenuItem, MenuRoot, MenuTrigger} from "../components/ui/menu";
import {LuSearch} from "react-icons/lu";
import CustomButton from "./CustomButton";
import { useNavigate } from 'react-router-dom';

export default function Nav() {
    const snap = useSnapshot(state);
    const isDesktop = useBreakpointValue({base: false, lg: true});
    const navigate = useNavigate();

    if (!snap.cart.length > 0 && snap.justCheckedOut) return (
        <nav>
            <HStack
                justify="space-between"
                padding="4rem 4rem"
                backgroundColor="black"
                height="50px"
            >
                <Image src={logo} alt="Company Logo" boxSize="100px" objectFit="contain"/>

                {/* Desktop Menu */}
                {isDesktop ? (
                    <HStack as="ul" spacing="20px" className="nav">
                        <CustomButton
                            type="filled"
                            title="Nuevo Cliente"
                            handleClick={() => {
                                state.showProductForm = false;
                                state.pickSize = false;
                                state.pickColor = false;
                                state.showCart = false;
                                state.showForm = true;
                                state.clientData = {}
                            }}
                            customeStyles="w-fit px-4 py-2.5 font-bold text-sm"
                        />

                        <CustomButton
                            type="filled"
                            title="Agregar otro producto"
                            handleClick={() => {
                                state.pickSize = false;
                                state.showProductForm = true;
                                state.pickColor = false;
                                state.showCart = false;
                            }}
                            customeStyles="w-fit px-4 py-2.5 font-bold text-sm"
                        />

                    </HStack>
                ) : (
                    // Mobile Menu
                    <MenuRoot>
                        <MenuTrigger asChild>
                            <IconButton variant="outline" size="sm">
                                <LuSearch/>
                            </IconButton>
                        </MenuTrigger>
                        <MenuContent>
                            <MenuItem
                                onClick={() => {
                                    state.showProductForm = false;
                                    state.pickSize = false;
                                    state.pickColor = false;
                                    state.showCart = false;
                                    state.showClientForm = true;
                                    state.clientData = {}
                                }}
                            >
                                Nuevo Cliente
                            </MenuItem>

                            <MenuItem
                                onClick={() => {
                                    state.pickSize = false;
                                    state.showProductForm = true;
                                    state.pickColor = false;
                                    state.showCart = false;
                                }}
                            >
                                Agregar otro producto
                            </MenuItem>

                        </MenuContent>
                    </MenuRoot>
                )}
            </HStack>
        </nav>
    );

    return (
        <nav>
            <HStack
                justify="space-between"
                padding="4rem 4rem"
                backgroundColor="black"
                height="50px"
            >
                <Image src={logo} alt="Company Logo" boxSize="100px" objectFit="contain"/>

                {/* Desktop Menu */}
                {isDesktop ? (
                    <HStack as="ul" spacing="20px" className="nav">
                        {!(snap.currentOrder.product_id === '') ?
                            (<CustomButton
                                type="filled"
                                title="Prendas"
                                handleClick={() => {
                                    state.showProductForm = true;
                                    state.pickSize = false;
                                    state.pickColor = false;
                                    state.showCart = false;
                                    navigate('/control-panel/product');
                                }}
                                customeStyles="w-fit px-4 py-2.5 font-bold text-sm"
                            />) : null
                        }

                        {!(snap.currentOrder.tela_id === '') ?
                        (<CustomButton
                            type="filled"
                            title="Colores"
                            handleClick={() => {
                                state.pickSize = false;
                                state.showProductForm = false;
                                state.pickColor = true;
                                state.showCart = false;
                                navigate('/control-panel/color');
                            }}
                            customeStyles="w-fit px-4 py-2.5 font-bold text-sm"
                        />) : null
                        }

                        {!(snap.currentOrder.size == 0) ?
                       ( <CustomButton
                            type="filled"
                            title="Tallas"
                            handleClick={() => {
                                state.pickSize = true;
                                state.showProductForm = false;
                                state.pickColor = false;
                                state.showCart = false;
                                navigate('/control-panel/size');
                            }}
                            customeStyles="w-fit px-4 py-2.5 font-bold text-sm"
                        />): null
                        }
                        {!(snap.cart.length === 0) ?
                        (<CustomButton
                            type="filled"
                            title="Carrito"
                            handleClick={() => {
                                state.showCart = true;
                                state.pickSize = false;
                                state.pickColor = false;
                                state.showProductForm = false;
                                navigate('/control-panel/cart');
                            }}
                            customeStyles="w-fit px-4 py-2.5 font-bold text-sm"
                        />): null
                        }
                    </HStack>
                ) : (
                    // Mobile Menu
                    <MenuRoot>
                        <MenuTrigger asChild>
                            <IconButton variant="outline" size="sm">
                                <LuSearch/>
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
