import React, { useState, useEffect } from 'react';
import useUserProfile from '../hooks/useUserProfile';
import apiUrl from './apiUrl';

function MyTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = useUserProfile();

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;

      try {
        const response = await fetch(`${apiUrl}/api/transactions/user/${user._id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch transactions');
        }

        const data = await response.json();
        setTransactions(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user]);

  // Filter and sort transactions to only include those with a matchId and sort by date
  const filteredTransactions = transactions
    .filter(transaction => transaction.matchId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort by date descending

  if (loading) return <div className="text-center p-4">Loading...</div>;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;
  if (!user) return <div className="text-center p-4">Please log in to view transactions</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">My Transactions</h2>
      
      {filteredTransactions.length === 0 ? (
        <p className="text-gray-500">No transactions found</p>
      ) : (
        <div className="space-y-4">
          {filteredTransactions.map((transaction) => (
            <div 
              key={transaction._id} 
              className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">
                    Amount: ${transaction.amount}
                  </p>
                  <p className={`text-sm ${
                    transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    Type: {transaction.type}
                  </p>
                  <p className="text-sm text-gray-600">
                    Status: {transaction.status}
                  </p>
                  {transaction.matchId && (
                    <p className="text-sm text-gray-700 mt-1">
                      Match: {transaction.matchId.homeTeam} vs {transaction.matchId.awayTeam}
                    </p>
                  )}
                </div>
                <div className="text-right text-sm text-gray-500">
                  <p>{new Date(transaction.createdAt).toLocaleDateString()}</p>
                  <p>{new Date(transaction.createdAt).toLocaleTimeString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyTransactions;
