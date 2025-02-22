import React from 'react'
import { useSnapshot } from 'valtio';

import state from '../store';
import { getContrastingColor } from '../config/helpers';

const CustomButton = ({ type, title, customStyles, handleClick, disabled }) => {
    const snap = useSnapshot(state);

    const generateStyle = (type) => {
        if(type === 'filled' || type === 'submit') {
            return {
                backgroundColor: snap.color,
                color: getContrastingColor(snap.color),
                opacity: disabled ? 0.5 : 1, // Reduce opacity if disabled
                cursor: disabled ? 'not-allowed' : 'pointer'
            }
        } else if(type === "outline") {
            return {
                borderWidth: '1px',
                borderColor: snap.color,
                color: snap.color,
                opacity: disabled ? 0.5 : 1,
                cursor: disabled ? 'not-allowed' : 'pointer'
            }
        }
    }

    return (
        <button
            type={type === "submit" ? "submit" : "button"}
            className={`px-2 py-1.5 flex-1 rounded-md ${customStyles}`}
            style={generateStyle(type)}
            onClick={handleClick}
            disabled={disabled} // Disable button while submitting
        >
            {title}
        </button>
    );
};
export default CustomButton;