import { useEffect } from 'react';
import { useSnapshot } from 'valtio';
import { state, saveCurrentState } from '../store';

const StatePersistence = () => {
    const snap = useSnapshot(state);

    useEffect(() => {
        // Función para guardar el estado
        const handleSaveState = () => {
            saveCurrentState();
        };

        // Detectar cuando se va a cerrar la página o recargar
        const handleBeforeUnload = (event) => {
            handleSaveState();
            // Opcional: mostrar un mensaje de confirmación
            // event.preventDefault();
            // event.returnValue = '';
        };

        // Detectar cuando se va a cerrar la página (no funciona en todos los navegadores)
        const handleUnload = () => {
            handleSaveState();
        };

        // Detectar cuando se presiona F5 o Ctrl+R
        const handleKeyDown = (event) => {
            if (event.key === 'F5' || (event.ctrlKey && event.key === 'r')) {
                handleSaveState();
            }
        };

        // Agregar event listeners
        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('unload', handleUnload);
        window.addEventListener('keydown', handleKeyDown);

        // Guardar el estado cada vez que cambie (opcional, para mayor seguridad)
        const intervalId = setInterval(handleSaveState, 30000); // Guardar cada 30 segundos

        // Cleanup function
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('unload', handleUnload);
            window.removeEventListener('keydown', handleKeyDown);
            clearInterval(intervalId);
            
            // Guardar el estado cuando el componente se desmonte
            handleSaveState();
        };
    }, []);

    // Guardar el estado cuando cambie (usando useEffect con snap como dependencia)
    useEffect(() => {
        // Solo guardar si hay datos relevantes
        if (snap.currentOrder.product_id || snap.cart.length > 0 || snap.userEmail) {
            saveCurrentState();
        }
    }, [snap.currentOrder, snap.cart, snap.userEmail, snap.clientData]);

    // Este componente no renderiza nada
    return null;
};

export default StatePersistence; 