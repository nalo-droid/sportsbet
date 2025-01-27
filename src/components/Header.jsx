import React from 'react';
import useUserProfile from '../hooks/useUserProfile';

function Header() {
    const user = useUserProfile();

    return (
        <div className=" bg-gray-900 text-white">
            <header className="bg-gray-800 py-4 px-6 ">
                <nav className="max-w-7xl mx-auto flex items-center justify-between">
                    <a href="/" className="text-2xl font-bold">
                        P2P Betting 
                    </a>
                    <div className="flex gap-4"> 
                        {user && (
                            <div className="flex items-center gap-4">
                                <span>{user.username}</span>
                                <span>Balance: ${user.balance}</span>
                            </div>
                        )}
                    </div>
                </nav>
            </header>
        </div>
    );
}

export default Header;