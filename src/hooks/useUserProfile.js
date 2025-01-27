import { useEffect, useState } from 'react';
import apiUrl from '../components/apiUrl';

function useUserProfile() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetch(`${apiUrl}/api/users/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(response => response.json())
            .then(data => setUser(data))
            .catch(error => console.error('Error fetching user profile:', error));
        }
    }, []);

    return user;
}

export default useUserProfile;
