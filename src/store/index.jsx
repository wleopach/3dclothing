import {proxy} from "valtio";

// Función para guardar el estado en localStorage
function saveStateToLocalStorage(state) {
    try {
        const stateToSave = {
            currentOrder: state.currentOrder,
            cart: state.cart,
            user: state.user,
            userEmail: state.userEmail,
            clientData: state.clientData,
            colorsData: state.colorsData,
            modelColorsData: state.modelColorsData,
            showForm: state.showForm,
            isUnLogged: state.isUnLogged,
            showProductForm: state.showProductForm,
            pickColor: state.pickColor,
            pickSize: state.pickSize,
            justCheckedOut: state.justCheckedOut
        };
        localStorage.setItem('state', JSON.stringify(stateToSave));
    } catch (error) {
        console.error('Error al guardar el estado en localStorage:', error);
    }
}

// Función para cargar el estado desde localStorage
function loadStateFromLocalStorage() {
    try {
        const savedState = localStorage.getItem('state');
        if (savedState) {
            return JSON.parse(savedState);
        }
    } catch (error) {
        console.error('Error al cargar el estado desde localStorage:', error);
    }
    return null;
}

// Cargar estado inicial desde localStorage
const defaultOrder = {
    "product_id": '',
    "tela_id": '',
    "quantity": 0,
    "size": 0,
    "client_email": '',
    "user_id": '',
    "sex": '',
    "productName": '', // Nombre del producto seleccionado
    "fabricName": '', //Nombre de la tela seleccionada
    "colorSelected": '',
    "codeSelected": '',
    "stock": '',
    "prenda": '',
    "details": {},
}

function getDefaultState() {
    const savedState = loadStateFromLocalStorage();
    return {
        cc: "",
        registered: true,
        intro: true,
        showCart: false,
        showPanel: false,
        color:'#EFBD48',
        colorGreen:'#008000',
        isLogoTexture: true,
        isFullTexture: false,
        logoDecal:'./threejs.png',
        fullDecal:'./threejs.png',
        file_3d: 'shirt_v.glb',
        showForm: savedState?.showForm ?? true,
        isUnLogged: savedState?.isUnLogged ?? true,
        showProductForm: savedState?.showProductForm ?? false,
        pickColor: savedState?.pickColor ?? false,
        user : savedState?.user ?? {},
        userEmail : savedState?.userEmail ?? '',
        clientData : savedState?.clientData ?? {},
        colorsData: savedState?.colorsData ?? [],
        modelColorsData: savedState?.modelColorsData ?? [], // Colores para el selector de modelo
        currentOrder: savedState?.currentOrder ?? defaultOrder,
        pickSize: savedState?.pickSize ?? false,
        cart: savedState?.cart ?? [],
        justCheckedOut: savedState?.justCheckedOut ?? false,
    };
}

let state;

function setDefaultState() {
    const copy = JSON.parse(JSON.stringify(getDefaultState()));
    state = proxy(copy);
}
setDefaultState();

// Función para guardar el estado actual
function saveCurrentState() {
    saveStateToLocalStorage(state);
}

// Función para limpiar el estado guardado
function clearSavedState() {
    try {
        localStorage.removeItem('state');
    } catch (error) {
        console.error('Error al limpiar el estado guardado:', error);
    }
}

function hasSavedState() {
    return localStorage.getItem('state') !== null;
}

function getSavedState() {
    return JSON.parse(localStorage.getItem('state'));
}

function addToCart() {
    // Extraer UUIDs de imágenes de los detalles
    const imageIds = [];
    
    if (state.currentOrder.details) {
        // Recorrer todos los campos de detalles para encontrar imágenes
        Object.entries(state.currentOrder.details).forEach(([key, value]) => {
            if (key.endsWith('_imageData') && value && value.id) {
                imageIds.push(value.id);
            }
        });
    }
    
    // Crear el producto con la información de imágenes
    const productToAdd = {
        ...state.currentOrder,
        imageIds: imageIds // Agregar array de UUIDs de imágenes
    };
    
    state.cart.push(productToAdd);
    saveCurrentState(); // Guardar después de agregar al carrito
}

function checkout() {
    state.cart = [];
    state.currentOrder = defaultOrder;
    clearSavedState(); // Limpiar el estado guardado después del checkout
}

function removeFromCart(index) {
    if (index >= 0 && index < state.cart.length) {
        state.cart.splice(index, 1);
        saveCurrentState(); // Guardar después de remover del carrito
    }
}

export {state, addToCart, checkout, removeFromCart, saveCurrentState, clearSavedState, setDefaultState, hasSavedState, getSavedState};