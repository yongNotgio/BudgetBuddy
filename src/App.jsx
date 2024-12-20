import { useState, useEffect } from "react";
import "./App.css";
import supabase from "./supabase-clientconfig";
import AuthForm from "./AuthForm";
import BudgetForm from "./BudgetForm";
import BudgetHistory from "./BudgetHistory";

function App() {
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [users, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('users');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Fetch categories when user is available
  useEffect(() => {
    if (users) {
      const fetchCategories = async () => {
        try {
          const { data, error } = await supabase.from("products").select("Category");
          if (error) throw error;

          const uniqueCategories = [...new Set(data.map((item) => item.Category))];
          setCategories(uniqueCategories);
        } catch (err) {
          console.error("Error fetching categories:", err);
        }
      };
      fetchCategories();
    }
  }, [users]);

  const handleSetUser = (userData) => {
    setUser(userData);
    localStorage.setItem('users', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('users');
    setSelectedCategories([]);
    setShowHistory(false);
  };

  const handleCheckboxChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category]
    );
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
    if (!showHistory) {
      setSelectedCategories([]); // Reset selected categories when viewing history
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="container">
      {!users ? (
        <AuthForm setUser={handleSetUser} />
      ) : (
        <div className="dashboard">
          <div className="header">
            <h2>Welcome, {users.username}!</h2>
            <div className="header-buttons">
              <button 
                onClick={toggleHistory}
                className="history-button"
              >
                {showHistory ? 'New Budget' : 'View History'}
              </button>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </div>
          </div>
          
          {showHistory ? (
            <BudgetHistory userId={users.id} />
          ) : (
            <BudgetForm
              categories={categories}
              selectedCategories={selectedCategories}
              handleCheckboxChange={handleCheckboxChange}
              userId={users.id}  // Pass userId to BudgetForm
            />
          )}
        </div>
      )}
    </div>
  );
}

export default App;