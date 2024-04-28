import { useState } from "react";

export default (key, defaultValue) => {

    const oldValue = localStorage.getItem(key);
    console.log('oldValue', oldValue);
    const [state, setState] = useState(oldValue ? JSON.parse(oldValue) : defaultValue);
	console.log('state', state);

    const changeState = (newValue) => {
        setState(newValue);
        localStorage.setItem(key, JSON.stringify(newValue))
    }

    return [state, changeState]
}