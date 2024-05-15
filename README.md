# ft_transcendence
testing version frontend using auth

add .env

docker-compose up (root)

http://localhost:3003/user/create/<number>
(also add the one of yourself as user)


/*
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

    */
