import React, { useState } from "react";
import { GoogleLogin, googleLogout } from "@react-oauth/google";
import { motion } from "framer-motion";
import "./Header.css";

const categories = [
    { name: "Accueil", href: "#" },
    { name: "Decks", href: "#" },
    { name: "Cartes", href: "#" },
    { name: "À propos", href: "#" },
];

function Header({ onLogin, onLogout }) {
    const [user, setUser] = useState(null);

    const handleLoginSuccess = (credentialResponse) => {
        const userObject = JSON.parse(atob(credentialResponse.credential.split(".")[1]));
        setUser(userObject);
        onLogin(userObject);
    };

    const handleLogout = () => {
        googleLogout();
        setUser(null);
        onLogout();
    };

    return (
        <header className="header">
            <h1 className="header-title">
              <span className="ludo-bold">Ludo</span><span className="deck-thin">Deck</span>
            </h1>
            <nav className="header-nav">
                {categories.map((cat) => (
                    <motion.a
                        key={cat.name}
                        href={cat.href}
                        className="header-link"
                        whileHover={{ scale: 1.08 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        {cat.name}
                    </motion.a>
                ))}
                {user ? (
                    <div className="header-user">
                        <motion.img
                            src={user.picture}
                            alt="User Avatar"
                            className="header-avatar"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        />
                        <span className="header-username">{user.name}</span>
                        <button
                            onClick={handleLogout}
                            className="header-logout"
                        >
                            Déconnexion
                        </button>
                    </div>
                ) : (
                    <div className="header-login">
                        <GoogleLogin
                            onSuccess={handleLoginSuccess}
                            onError={() => console.log("Login Failed")}
                            theme="filled_blue"
                            shape="pill"
                            size="medium"
                        />
                    </div>
                )}
            </nav>
        </header>
    );
}

export default Header;