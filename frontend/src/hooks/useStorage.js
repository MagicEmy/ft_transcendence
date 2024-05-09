import { useState } from "react";

export default function useStorage (key, defaultValue) {

    const oldValue = localStorage.getItem(key);
    const [state, setState] = useState(oldValue ? JSON.parse(oldValue) : defaultValue);

    const changeState = (newValue) => {
        setState(newValue);
        localStorage.setItem(key, JSON.stringify(newValue))
    }

    return [state, changeState]
}
