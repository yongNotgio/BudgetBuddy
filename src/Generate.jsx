import { useState, useEffect, useRef } from "react";
import supabase from "./supabase-clientconfig";
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// PDF styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  section: {
    margin: 10,
    padding: 10,
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
  }
});

// PDF Document component
const BudgetPDF = ({ budgetData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Grocery Budget Plan</Text>
      <View style={styles.section}>
        <Text style={styles.text}>Total Budget: ₱{budgetData.totalBudget}</Text>
        <Text style={styles.text}>Timeframe: {budgetData.timeframe}</Text>
        <Text style={styles.text}>Total Spent: ₱{budgetData.totalSpent}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.text}>Shopping List:</Text>
        {Object.entries(budgetData.items).map(([category, items]) => (
          <View key={category}>
            <Text style={styles.text}>{category}:</Text>
            {items.map((item, index) => (
              <Text key={index} style={styles.text}>
                - {item.productName} (₱{item.unitPrice} x {item.quantity}): ₱{item.totalPrice}
              </Text>
            ))}
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

function Generate({ selectedCategories, totalBudget, timeframe, goBack, userId }) {
  const [shoppingList, setShoppingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overallTotal, setOverallTotal] = useState(0);
  const [budgetSaved, setBudgetSaved] = useState(false);
  const saveAttempted = useRef(false);

  const calculateReasonableQuantity = (priority, timeframe) => {
    const baseUnits = Math.ceil(priority / 2);
    const weeklyConsumption = baseUnits * 2;
    return timeframe === "weekly" ? weeklyConsumption : weeklyConsumption * 4;
  };

  useEffect(() => {
    const generateBudget = async () => {
      if (saveAttempted.current) return; // Prevent double execution
      
      try {
        // Fetch products with error handling
        const { data: products, error: fetchError } = await supabase
          .from("products")
          .select("*")
          .in("Category", selectedCategories)
          .gt("Price", 0)
          .gt("Priority", 0);

        if (fetchError) throw fetchError;

        // Calculate total priority score for budget allocation
        const categoryPriorities = {};
        const totalPriorityScore = products.reduce((total, product) => {
          if (!categoryPriorities[product.Category]) {
            categoryPriorities[product.Category] = 0;
          }
          categoryPriorities[product.Category] += product.Priority;
          return total + product.Priority;
        }, 0);

        // Generate shopping list
        const list = [];
        let overallSum = 0;

        for (const category of selectedCategories) {
          const categoryProducts = products
            .filter(product => product.Category === category)
            .sort((a, b) => b.Priority - a.Priority);

          if (categoryProducts.length > 0) {
            let categoryBudget = (categoryPriorities[category] / totalPriorityScore) * totalBudget;
            let remainingBudget = categoryBudget;

            for (const product of categoryProducts) {
              if (product.Price <= remainingBudget) {
                const maxBudgetQuantity = Math.floor(remainingBudget / product.Price);
                const reasonableQuantity = calculateReasonableQuantity(product.Priority, timeframe);
                const quantity = Math.min(maxBudgetQuantity, reasonableQuantity);

                if (quantity > 0) {
                  const totalPrice = quantity * product.Price;
                  
                  list.push({
                    productName: product.ProductName,
                    category: product.Category,
                    unitPrice: product.Price.toFixed(2),
                    quantity,
                    totalPrice: totalPrice.toFixed(2),
                  });

                  overallSum += totalPrice;
                  remainingBudget -= totalPrice;
                }
              }
            }

            // Fallback for empty categories
            if (!list.some(item => item.category === category)) {
              const highestPriorityProduct = categoryProducts[0];
              list.push({
                productName: highestPriorityProduct.ProductName,
                category: highestPriorityProduct.Category,
                unitPrice: highestPriorityProduct.Price.toFixed(2),
                quantity: 1,
                totalPrice: highestPriorityProduct.Price.toFixed(2),
              });
              overallSum += highestPriorityProduct.Price;
            }
          }
        }

        setShoppingList(list);
        setOverallTotal(overallSum.toFixed(2));

        // Save to database only if not previously attempted
        if (!saveAttempted.current) {
          const groupedItems = list.reduce((acc, item) => {
            if (!acc[item.category]) {
              acc[item.category] = [];
            }
            acc[item.category].push(item);
            return acc;
          }, {});
          
          const { error: saveError } = await supabase
            .from('grocery_budgets')
            .insert([{
              user_id: userId,
              total_budget: totalBudget,
              timeframe: timeframe,
              categories: selectedCategories,
              generated_items: groupedItems
            }]);

          if (saveError) throw saveError;
          setBudgetSaved(true);
          saveAttempted.current = true; // Mark as saved
        }

      } catch (err) {
        setError(err.message);
        console.error("Error generating budget:", err);
      } finally {
        setLoading(false);
      }
    };

    generateBudget();
  }, [selectedCategories, totalBudget, timeframe, userId]);

  if (loading) {
    return <div className="loading">Generating your budget plan...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <h3>Error generating budget</h3>
        <p>{error}</p>
        <button onClick={goBack}>Go Back</button>
      </div>
    );
  }

  const budgetData = {
    totalBudget,
    timeframe,
    totalSpent: overallTotal,
    items: shoppingList.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {})
  };

  return (
    <div className="generated-budget">
      <div className="budget-header">
        <h2>Generated Budget Plan</h2>
        <div className="budget-actions">
          <PDFDownloadLink
            document={<BudgetPDF budgetData={budgetData} />}
            fileName={`budget-plan-${new Date().toISOString().split('T')[0]}.pdf`}
            className="download-button"
          >
            {({ loading }) => 
              loading ? 'Preparing PDF...' : 'Download PDF'
            }
          </PDFDownloadLink>
          <button onClick={goBack} className="back-button">
            Create New Budget
          </button>
        </div>
      </div>

      <div className="budget-summary">
        <p>Total Budget: ₱{totalBudget}</p>
        <p>Total Spent: ₱{overallTotal}</p>
        <p>Timeframe: {timeframe}</p>
      </div>

      <table className="shopping-list-table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Product Name</th>
            <th>Unit Price</th>
            <th>Quantity</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {shoppingList.map((item, index) => (
            <tr key={`${item.category}-${item.productName}-${index}`}>
              <td>{item.category}</td>
              <td>{item.productName}</td>
              <td>₱{item.unitPrice}</td>
              <td>{item.quantity}</td>
              <td>₱{item.totalPrice}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {budgetSaved && (
        <div className="success-message">
          Budget plan has been saved to your history.
        </div>
      )}
    </div>
  );
}

export default Generate;