import {HStack, Image, useBreakpointValue, IconButton} from "@chakra-ui/react";
import {useSnapshot} from "valtio";
import {state} from "../store"; // Import Valtio state
import logo from "../assets/images/logo.png";
import {MenuContent, MenuItem, MenuRoot, MenuTrigger} from "../components/ui/menu";
import {LuSearch} from "react-icons/lu";
import CustomButton from "./CustomButton";
import { useNavigate, useLocation } from 'react-router-dom';

export default function Nav() {
    const snap = useSnapshot(state);
    const isDesktop = useBreakpointValue({base: false, lg: true});
    const navigate = useNavigate();
    const location = useLocation();

    const colorSelected = '!bg-orange-500';

    const isCurrentRoute = (path) => {
        return location.pathname === path;
    };

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
                                state.clientData = {};
                                state.currentOrder = {};
                                navigate("/control-panel")
                            }}
                            customStyles={`w-fit px-4 py-2.5 font-bold text-sm ${isCurrentRoute('/control-panel') ? colorSelected : ''}`}
                        />

                        <CustomButton
                            type="filled"
                            title="Agregar otro producto"
                            handleClick={() => {
                                state.pickSize = false;
                                state.showProductForm = true;
                                state.pickColor = false;
                                state.showCart = false;
                                navigate("/control-panel/current-order/product")
                            }}
                            customStyles={`w-fit px-4 py-2.5 font-bold text-sm ${isCurrentRoute('/control-panel/current-order/product') ? colorSelected : ''}`}
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
                                    state.currentOrder = {};
                                    navigate("/control-panel")
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
                                    navigate("/control-panel/current-order/product")
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
                                    navigate('/control-panel/current-order/product');
                                }}
                                customStyles={`w-fit px-4 py-2.5 font-bold text-sm ${isCurrentRoute('/control-panel/current-order/product') ? colorSelected : ''}`}
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
                                navigate('/control-panel/current-order/color');
                            }}
                            customStyles={`w-fit px-4 py-2.5 font-bold text-sm ${isCurrentRoute('/control-panel/current-order/color') ? colorSelected : ''}`}
                        />) : null
                        }

                        {!(snap.currentOrder.prenda === '') ?
                        (<CustomButton
                            type="filled"
                            title="Detalles"
                            handleClick={() => {
                                state.pickSize = false;
                                state.showProductForm = false;
                                state.pickColor = true;
                                state.showCart = false;
                                navigate('/control-panel/current-order/details');
                            }}
                            customStyles={`w-fit px-4 py-2.5 font-bold text-sm ${isCurrentRoute('/control-panel/current-order/details') ? colorSelected : ''}`}
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
                                navigate('/control-panel/current-order/size');
                            }}
                            customStyles={`w-fit px-4 py-2.5 font-bold text-sm ${isCurrentRoute('/control-panel/current-order/size') ? colorSelected : ''}`}
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
                                navigate('/control-panel/current-order/cart');
                            }}
                            customStyles={`w-fit px-4 py-2.5 font-bold text-sm ${isCurrentRoute('/control-panel/current-order/cart') ? colorSelected : ''}`}
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
                                    navigate('/control-panel/current-order/product');
                                }}
                                style={{
                                    backgroundColor: isCurrentRoute('/control-panel/current-order/product') ? colorSelected : 'transparent'
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
                                    navigate('/control-panel/current-order/color');
                                }}
                                style={{
                                    backgroundColor: isCurrentRoute('/control-panel/current-order/color') ? colorSelected : 'transparent'
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
                                    navigate('/control-panel/current-order/size');
                                }}
                                style={{
                                    backgroundColor: isCurrentRoute('/control-panel/current-order/size') ? colorSelected : 'transparent'
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
                                    navigate('/control-panel/current-order/cart');
                                }}
                                style={{
                                    backgroundColor: isCurrentRoute('/control-panel/current-order/cart') ? colorSelected : 'transparent'
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
