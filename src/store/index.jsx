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
const savedState = loadStateFromLocalStorage();
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

const defaultState = {
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
    showForm: true,
    isUnLogged: true,
    showProductForm: false,
    pickColor: false,
    user : {},
    userEmail : '',
    clientData : {},
    colorsData: [],
    modelColorsData: [], // Colores para el selector de modelo
    currentOrder: defaultOrder,
    pickSize: false,
    cart: [],
    justCheckedOut: false,
}

let state;

function setDefaultState() {
    const copy = JSON.parse(JSON.stringify(defaultState));
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

function addToCart() {
    state.cart.push({ ...state.currentOrder });
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

export {state, addToCart, checkout, removeFromCart, saveCurrentState, clearSavedState, setDefaultState};