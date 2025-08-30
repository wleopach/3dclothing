import { useEffect } from 'react';

const ConfirmDialog = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title = "Confirmar acción", 
    message = "¿Está seguro de que desea continuar?", 
    confirmText = "Confirmar", 
    cancelText = "Cancelar",
    confirmColor = "#e53e3e",
    cancelColor = "#4a5568"
}) => {
    useEffect(() => {
        if (!isOpen) return;

        // Crear el contenedor de la alerta
        const alertContainer = document.createElement('div');
        alertContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        `;

        const alertBox = document.createElement('div');
        alertBox.style.cssText = `
            background-color: #1a202c;
            border: 2px solid #3182ce;
            border-radius: 12px;
            padding: 24px;
            max-width: 400px;
            width: 90%;
            text-align: center;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
        `;

        const titleElement = document.createElement('h3');
        titleElement.textContent = title;
        titleElement.style.cssText = `
            color: #3182ce;
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 16px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

        const messageElement = document.createElement('p');
        messageElement.textContent = message;
        messageElement.style.cssText = `
            color: white;
            font-size: 16px;
            margin-bottom: 24px;
            line-height: 1.5;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            gap: 12px;
            justify-content: center;
            flex-wrap: wrap;
        `;

        const cancelButton = document.createElement('button');
        cancelButton.textContent = cancelText;
        cancelButton.style.cssText = `
            background-color: ${cancelColor};
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            transition: background-color 0.2s;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
        
        // Efecto hover para el botón cancelar
        const cancelHoverColor = cancelColor === "#4a5568" ? "#2d3748" : "#2d3748";
        cancelButton.onmouseover = () => cancelButton.style.backgroundColor = cancelHoverColor;
        cancelButton.onmouseout = () => cancelButton.style.backgroundColor = cancelColor;

        const confirmButton = document.createElement('button');
        confirmButton.textContent = confirmText;
        confirmButton.style.cssText = `
            background-color: ${confirmColor};
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            transition: background-color 0.2s;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
        
        // Efecto hover para el botón confirmar
        const confirmHoverColor = confirmColor === "#e53e3e" ? "#c53030" : "#c53030";
        confirmButton.onmouseover = () => confirmButton.style.backgroundColor = confirmHoverColor;
        confirmButton.onmouseout = () => confirmButton.style.backgroundColor = confirmColor;

        const handleCancel = () => {
            document.body.removeChild(alertContainer);
            onClose();
        };

        const handleConfirm = () => {
            document.body.removeChild(alertContainer);
            onConfirm();
        };

        cancelButton.onclick = handleCancel;
        confirmButton.onclick = handleConfirm;

        buttonContainer.appendChild(cancelButton);
        buttonContainer.appendChild(confirmButton);

        alertBox.appendChild(titleElement);
        alertBox.appendChild(messageElement);
        alertBox.appendChild(buttonContainer);
        alertContainer.appendChild(alertBox);

        document.body.appendChild(alertContainer);

        // Cerrar con Escape
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                handleCancel();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);

        // Cerrar al hacer clic fuera del modal
        alertContainer.onclick = (event) => {
            if (event.target === alertContainer) {
                handleCancel();
            }
        };

        // Cleanup function
        return () => {
            if (document.body.contains(alertContainer)) {
                document.body.removeChild(alertContainer);
            }
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose, onConfirm, title, message, confirmText, cancelText, confirmColor, cancelColor]);

    // Este componente no renderiza nada visualmente
    return null;
};

export default ConfirmDialog; 