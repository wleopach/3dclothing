import { useSnapshot } from 'valtio';
import state from "../store";

const Cart = () => {
    const snap = useSnapshot(state);

    if (!snap.showCart) return null;

    return (
        <div className="p-4 border rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Listado de productos</h2>
            {snap.cart.length === 0 ? (
                <p className="text-gray-500">Your cart is empty.</p>
            ) : (
                <ul className="space-y-4">
                    {snap.cart.map((item, index) => (
                        <li key={index} className="p-2 border rounded-lg flex justify-between items-center">
                            <div>
                                <p className="font-semibold">Product ID: {item.product_id}</p>
                                <p>Talla: {item.size}</p>
                                <p>Cantidad: {item.quantity}</p>
                                <p>Correo: {item.client_email}</p>
                                <p>Sexo: {item.sex}</p>
                            </div>
                            <button
                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                onClick={() => state.cart.splice(index, 1)}
                            >
                                Remove
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Cart;