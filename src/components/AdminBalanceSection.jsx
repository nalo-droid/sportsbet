import React, { useState } from 'react';
import apiUrl from './apiUrl';

const styles = {
  balanceForm: "bg-[#2a2b36] rounded-lg p-6 mb-6",
  sectionTitle: "text-xl font-bold mb-4",
  input: "w-full p-3 bg-[#1a1b26] border border-gray-700 rounded-lg text-white mb-4",
  button: "px-4 py-2 rounded-lg font-medium transition-colors",
};

// This is a temporary component for testing purposes
const AdminBalanceSection = ({ users, setMessage }) => {
  const [selectedUser, setSelectedUser] = useState('');
  const [topUpAmount, setTopUpAmount] = useState('');

  const handleAddBalance = async (e) => {
    e.preventDefault();
    
    if (!selectedUser || !topUpAmount || isNaN(topUpAmount) || Number(topUpAmount) <= 0) {
      setMessage({ 
        text: 'Please select a user and enter a valid amount', 
        isError: true 
      });
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/admin/add-balance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser,
          amount: Number(topUpAmount)
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage({ 
          text: `Successfully added ${topUpAmount} ETB to ${data.user}'s balance`, 
          isError: false 
        });
        setTopUpAmount('');
        setSelectedUser('');
      } else {
        throw new Error(data.message || 'Failed to add balance');
      }
    } catch (error) {
      console.error('Error adding balance:', error);
      setMessage({ 
        text: error.message || 'Failed to add balance', 
        isError: true 
      });
    }
  };

  return (
    <div className={styles.balanceForm}>
      <h2 className={styles.sectionTitle}>Add Balance (Testing Only)</h2>
      <form onSubmit={handleAddBalance} className="space-y-4">
        <div>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className={styles.input}
          >
            <option value="">Select User</option>
            {users.map(user => (
              <option key={user._id} value={user._id}>
                {user.username} (Current Balance: {user.balance} ETB)
              </option>
            ))}
          </select>
        </div>
        <div>
          <input
            type="number"
            value={topUpAmount}
            onChange={(e) => setTopUpAmount(e.target.value)}
            placeholder="Amount to add"
            className={styles.input}
            min="1"
          />
        </div>
        <button
          type="submit"
          className={`${styles.button} bg-green-600 hover:bg-green-700 text-white`}
        >
          Add Balance
        </button>
      </form>
    </div>
  );
};

export default AdminBalanceSection; 