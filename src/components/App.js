import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Header from "./Header";
import Board from "./Board";
import "../styles/App.css";

function App() {
  const [user, setUser] = useState(null);
  const [decks, setDecks] = useState([]);

  // Charger les decks sauvegardés au démarrage
  useEffect(() => {
    const savedDecks = localStorage.getItem("userDecks");
    if (savedDecks) {
      setDecks(JSON.parse(savedDecks));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const saveDeck = (deck) => {
    const updatedDecks = [...decks, deck];
    setDecks(updatedDecks);
    localStorage.setItem("userDecks", JSON.stringify(updatedDecks));
  };

  return (
      <GoogleOAuthProvider clientId="261223390100-qt690aqu9vq7mp8egieg3c7j9usagttg.apps.googleusercontent.com">
        <div className="app">
          <Header onLogin={handleLogin} onLogout={handleLogout} />
          <main className="app-content">
            <Routes>
              <Route path="/" element={<Navigate to="/builder" />} />
              <Route path="/builder" element={<Board onSaveDeck={saveDeck} user={user} />} />
              {/* Ajoutez d'autres routes selon vos besoins */}
            </Routes>
          </main>
        </div>
      </GoogleOAuthProvider>
  );
}

export default App;