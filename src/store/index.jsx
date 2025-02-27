import {proxy} from "valtio";
const state = proxy({
    intro: true,
    showCart: false,
    color:'#EFBD48',
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
    stock: '',
    currentOrder: {
        "product_id":'',
        "tela_id":'',
        "quantity":0,
        "size": 0,
        "client_email":'',
        "user_id": '',
        "sex":'',
    },
    pickSize: false,
    cart:[],
    justCheckedOut: false,

});
function addToCart() {
    state.cart.push({ ...state.currentOrder });
}

function checkout() {
    state.cart = [];
    state.currentOrder = {
        "product_id": '',
        "tela_id": '',
        "quantity": 0,
        "size": 0,
        "client_email": '',
        "user_id": '',
        "sex": '',
    };
}
function removeFromCart(index) {
    if (index >= 0 && index < state.cart.length) {
        state.cart.splice(index, 1);
    }
}
export   {state , addToCart, checkout, removeFromCart};