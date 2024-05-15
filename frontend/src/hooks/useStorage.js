
import { useState, useEffect } from 'react';

export default function useStorage(key, defaultValue) {
    const getValue = () => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
        }
    };

    const setValue = (value) => {
        try {
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    };

    const [storedValue, setStoredValue] = useState(getValue());

    useEffect(() => {
        setValue(storedValue);
    }, [storedValue]);

    

    return [storedValue, setStoredValue]
}
