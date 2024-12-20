import { useState } from "react";
import Generate from "./Generate";

function BudgetForm({ categories, selectedCategories, handleCheckboxChange, userId }) {
  const [budget, setBudget] = useState("");
  const [timeframe, setTimeframe] = useState("");
  const [showGenerate, setShowGenerate] = useState(false);
  const [errors, setErrors] = useState({
    budget: "",
    categories: "",
    timeframe: ""
  });

  const validateForm = () => {
    const newErrors = {
      budget: "",
      categories: "",
      timeframe: ""
    };

    // Validate budget
    const budgetNum = Number(budget);
    if (!budget) {
      newErrors.budget = "Budget is required";
    } else if (isNaN(budgetNum) || budgetNum <= 0) {
      newErrors.budget = "Budget must be a positive number";
    }

    // Validate categories
    if (selectedCategories.length === 0) {
      newErrors.categories = "Please select at least one category";
    }

    // Validate timeframe
    if (!timeframe) {
      newErrors.timeframe = "Please select a timeframe";
    }

    setErrors(newErrors);
    return Object.values(newErrors).every(error => error === "");
  };

  const handleBudgetChange = (e) => {
    const value = e.target.value;
    // Allow empty string or positive numbers only
    if (value === "" || (/^\d*\.?\d*$/.test(value) && !isNaN(Number(value)))) {
      setBudget(value);
      // Clear budget error if it exists
      if (errors.budget) {
        setErrors(prev => ({ ...prev, budget: "" }));
      }
    }
  };

  const handleTimeframeChange = (e) => {
    setTimeframe(e.target.value);
    // Clear timeframe error if it exists
    if (errors.timeframe) {
      setErrors(prev => ({ ...prev, timeframe: "" }));
    }
  };

  const handleCategoryChange = (category) => {
    handleCheckboxChange(category);
    // Clear categories error if at least one is selected
    if (errors.categories && selectedCategories.length > 0) {
      setErrors(prev => ({ ...prev, categories: "" }));
    }
  };

  const handleGenerateClick = () => {
    if (validateForm()) {
      setShowGenerate(true);
    }
  };

  const handleGoBack = () => {
    setShowGenerate(false);
  };

  if (showGenerate) {
    return (
      <Generate
        selectedCategories={selectedCategories}
        totalBudget={Number(budget)}
        timeframe={timeframe}
        goBack={handleGoBack}
        userId={userId}
      />
    );
  }

  return (
    <div className="budget-form-container">
      <h1>Smart Budget Allocation</h1>
      <form className="budget-form" onSubmit={(e) => e.preventDefault()}>
        <div className="form-group">
          <label htmlFor="total-budget">Total Grocery Budget:</label>
          <input
            type="text"
            id="total-budget"
            value={budget}
            onChange={handleBudgetChange}
            className={errors.budget ? "error" : ""}
            placeholder="Enter your budget"
            required
          />
          {errors.budget && <span className="error-message">{errors.budget}</span>}
        </div>

        <div className="form-group">
          <label>Select Categories:</label>
          <div id="grocery-categories">
            {categories.map((category, index) => (
              <div key={category} className="category-item">
                <input
                  type="checkbox"
                  id={`category-${index}`}
                  value={category}
                  checked={selectedCategories.includes(category)}
                  onChange={() => handleCategoryChange(category)}
                />
                <label htmlFor={`category-${index}`}>{category}</label>
              </div>
            ))}
          </div>
          {errors.categories && <span className="error-message">{errors.categories}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="timeframe">Timeframe:</label>
          <select
            id="timeframe"
            value={timeframe}
            onChange={handleTimeframeChange}
            className={errors.timeframe ? "error" : ""}
            required
          >
            <option value="">Select timeframe</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          {errors.timeframe && <span className="error-message">{errors.timeframe}</span>}
        </div>

        <div className="buttons">
          <button
            type="button"
            className="generate-button"
            onClick={handleGenerateClick}
          >
            Generate List
          </button>
        </div>
      </form>
    </div>
  );
}

export default BudgetForm;