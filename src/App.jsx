import { useState, useEffect } from "react";
import "./App.css";
import supabase from "./supabase-clientconfig";
import AuthForm from "./AuthForm";
import BudgetForm from "./BudgetForm";

function App() {
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (user) {
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
  }, [user]);

  const handleLogout = () => {
    setUser(null);
  };

  const handleCheckboxChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((item) => item !== category) // Remove if unchecked
        : [...prev, category] // Add if checked
    );
  };

  return (
    <div className="container">
      {!user ? (
        <AuthForm setUser={setUser} />
      ) : (
        <>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
          <BudgetForm
            categories={categories}
            selectedCategories={selectedCategories}
            handleCheckboxChange={handleCheckboxChange}
          />
        </>
      )}
    </div>
  );
}

export default App;