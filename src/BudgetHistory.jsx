import React, { useState, useEffect } from 'react';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import supabase from './supabase-clientconfig';

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
const BudgetPDF = ({ budget }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Grocery Budget Plan</Text>
      <View style={styles.section}>
        <Text style={styles.text}>Total Budget: ₱{budget.total_budget}</Text>
        <Text style={styles.text}>Timeframe: {budget.timeframe}</Text>
        <Text style={styles.text}>Categories: {budget.categories.join(', ')}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.text}>Shopping List:</Text>
        {Object.entries(budget.generated_items).map(([category, items]) => (
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

const BudgetHistory = ({ userId }) => {
  const [budgetHistory, setBudgetHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBudgetHistory();
  }, [userId]);

  const fetchBudgetHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('grocery_budgets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBudgetHistory(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate total spent for a budget
  const calculateTotalSpent = (items) => {
    return Object.values(items).reduce((total, categoryItems) => {
      return total + categoryItems.reduce((catTotal, item) => {
        return catTotal + (parseFloat(item.totalPrice) || 0);
      }, 0);
    }, 0).toFixed(2);
  };

  if (loading) return <div>Loading history...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="budget-history">
      <h2>Budget History</h2>
      <div className="history-list">
        {budgetHistory.map((budget) => {
          const totalSpent = calculateTotalSpent(budget.generated_items);
          
          return (
            <div key={budget.id} className="history-item">
              <div className="history-details">
                <h3>₱{budget.total_budget} - {budget.timeframe}</h3>
                <p>Created: {new Date(budget.created_at).toLocaleDateString()}</p>
                <p>Categories: {budget.categories.join(', ')}</p>
                <p>Total Spent: ₱{totalSpent}</p>
              </div>
              <PDFDownloadLink
                document={<BudgetPDF budget={budget} />}
                fileName={`budget-${budget.id}-${new Date(budget.created_at).toISOString().split('T')[0]}.pdf`}
                className="download-button"
              >
                {({ loading }) => 
                  loading ? 'Preparing PDF...' : 'Download PDF'
                }
              </PDFDownloadLink>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BudgetHistory;