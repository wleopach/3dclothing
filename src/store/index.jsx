import {proxy} from "valtio";
const state = proxy({
    intro: true,
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
    currentOrder: {},
    pickSize: false,
    cart:[]


});
export default state;