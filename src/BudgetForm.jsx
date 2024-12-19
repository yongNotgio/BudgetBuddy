

function BudgetForm({ categories, selectedCategories, handleCheckboxChange }) {
  return (
    <div>
      <h1>Smart Budget Allocation</h1>
      <form className="budget-form">
        <label htmlFor="total-budget">Total Grocery Budget:</label>
        <input
          type="number"
          id="total-budget"
          name="total-budget"
          placeholder="Enter your budget"
          required
        />

        <div id="grocery-categories">
          {categories.map((category, index) => (
            <div key={index} className="category-item">
              <input
                type="checkbox"
                id={`category-${index}`}
                name="grocery-category"
                value={category}
                onChange={() => handleCheckboxChange(category)}
              />
              <label htmlFor={`category-${index}`}>{category}</label>
            </div>
          ))}
        </div>

        <label htmlFor="timeframe">Timeframe:</label>
        <select id="timeframe" name="timeframe" required>
          <option value="">Select timeframe</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>

        <div className="summary">
          <h3>Summary:</h3>
          <div id="summary-text">
            {selectedCategories.length > 0 ? (
              <ul>
                {selectedCategories.map((category, index) => (
                  <li key={index}>{category}</li>
                ))}
              </ul>
            ) : (
              "No categories selected yet."
            )}
          </div>
        </div>

        <div className="buttons">
          <button type="reset" className="cancel-button">
            Cancel
          </button>
          <a href="generate.html">
            <button type="button" className="generate-button">
              Generate List
            </button>
          </a>
        </div>
      </form>
    </div>
  );
}

export default BudgetForm;

