import React, { useState, useEffect } from 'react';
import { FaFutbol, FaPlus, FaCheck, FaPlay, FaTrash, FaCog, FaStop } from 'react-icons/fa';
import apiUrl from './apiUrl';
import AdminBalanceSection from './AdminBalanceSection';

const FOOTBALL_API_URL = 'https://api.football-data.org/v4';

// Add these styles at the top of the component
const styles = {
  container: "min-h-screen bg-[#1a1b26] text-white p-4",
  header: "flex items-center gap-3 mb-6",
  title: "text-2xl font-bold",
  section: "bg-[#2a2b36] rounded-lg p-6 mb-6",
  sectionTitle: "text-xl font-bold mb-4",
  input: "w-full p-3 bg-[#1a1b26] border border-gray-700 rounded-lg text-white mb-4",
  button: "px-4 py-2 rounded-lg font-medium transition-colors",
  card: "bg-[#2a2b36] rounded-lg p-4 mb-4",
  cardHeader: "flex justify-between items-center mb-3",
  cardTitle: "text-lg font-semibold",
  cardStatus: "px-3 py-1 rounded-full text-sm",
  statGrid: "grid grid-cols-2 gap-4 mt-4",
  statCard: "bg-[#1a1b26] p-4 rounded-lg",
  statLabel: "text-sm text-gray-400",
  statValue: "text-xl font-bold text-green-400",
  balanceForm: "bg-[#2a2b36] rounded-lg p-6 mb-6",
};

function Admin() {
  const [selectedMatches, setSelectedMatches] = useState([]);
  const [matchesFromAPI, setMatchesFromAPI] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState('');
  const [message, setMessage] = useState({ text: '', isError: false });
  const [existingMatches, setExistingMatches] = useState([]);
  const [footballApiKey, setFootballApiKey] = useState('');
  const [selectedMatchForResult, setSelectedMatchForResult] = useState(null);
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [matchDateTime, setMatchDateTime] = useState('');
  const [customHomeTeam, setCustomHomeTeam] = useState('');
  const [customAwayTeam, setCustomAwayTeam] = useState('');
  const [customMatchDateTime, setCustomMatchDateTime] = useState('');
  const [showCustomMatchModal, setShowCustomMatchModal] = useState(false);
  const [selectedTemplateForResult, setSelectedTemplateForResult] = useState(null);
  const [deletionConfirm, setDeletionConfirm] = useState(null);
  const [selectedUser, setSelectedUser] = useState('');
  const [topUpAmount, setTopUpAmount] = useState('');
  const [users, setUsers] = useState([]);
  const [houseProfits, setHouseProfits] = useState({
    totalCommission: 0,
    totalMatches: 0,
    matchDetails: []
  });
  const [showProfitDetails, setShowProfitDetails] = useState(false);

  useEffect(() => {
    fetchFootballApiKey();
    fetchLeagues();
    fetchExistingMatches();
    fetchUsers();
    fetchHouseProfits();
  }, []);

  const fetchFootballApiKey = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/admin/get-football-api-key`);
      const data = await response.json();
      setFootballApiKey(data.apiKey);
    } catch (error) {
      console.error('Error fetching API key:', error);
    }
  };

  const fetchLeagues = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/admin/fetch-leagues`);
      const data = await response.json();
      setLeagues(data.competitions);
    } catch (error) {
      console.error('Error fetching leagues:', error);
    }
  };

  const fetchMatches = async (leagueId) => {
    try {
      const response = await fetch(`${apiUrl}/api/admin/fetch-matches/${leagueId}`);
      const data = await response.json();
      setMatchesFromAPI(data.matches);
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  const fetchExistingMatches = async () => {
    try {
      const templatesResponse = await fetch(`${apiUrl}/api/matches/templates`);
      const templates = await templatesResponse.json();
      
      // Fetch user game stats for each template
      const templatesWithStats = await Promise.all(templates.map(async (template) => {
        const statsResponse = await fetch(`${apiUrl}/api/admin/template-stats/${template._id}`);
        const stats = await statsResponse.json();
        return {
          ...template,
          stats
        };
      }));
      
      setExistingMatches(templatesWithStats);
    } catch (error) {
      console.error('Error fetching templates:', error);
      setMessage({ text: 'Failed to load templates', isError: true });
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/admin/users`);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setMessage({ text: 'Failed to load users', isError: true });
    }
  };

  const fetchHouseProfits = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/admin/house-profits`);
      const data = await response.json();
      setHouseProfits(data);
    } catch (error) {
      console.error('Error fetching house profits:', error);
      setMessage({ text: 'Failed to load house profits', isError: true });
    }
  };

  const handleLeagueChange = (e) => {
    const leagueId = e.target.value;
    setSelectedLeague(leagueId);
    if (leagueId) fetchMatches(leagueId);
  };

  const toggleMatchSelection = (match) => {
    setSelectedMatches(prev => 
      prev.some(m => m.id === match.id) 
        ? prev.filter(m => m.id !== match.id)
        : [...prev, match]
    );
  };

  const createSelectedMatches = async () => {
    try {
      const matchesToCreate = selectedMatches.map(match => ({
        homeTeam: match.homeTeam.name,
        awayTeam: match.awayTeam.name,
        matchDate: new Date(match.utcDate),
        apiId: match.id,
        isTemplate: true
      }));

      const response = await fetch(`${apiUrl}/api/admin/create-matches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ matches: matchesToCreate })
      });

      const data = await response.json();
      if (response.ok) {
        setMessage({ text: `Successfully created ${data.createdCount} template matches`, isError: false });
        setSelectedMatches([]);
        fetchExistingMatches();
      } else {
        setMessage({ text: data.message || 'Error creating matches', isError: true });
      }
    } catch (error) {
      setMessage({ text: 'Failed to create matches', isError: true });
    }
  };

  const handleStartGame = async (matchId) => {
    const actualMatchId = matchId.startsWith('template_') ? matchId.replace('template_', '') : matchId;
    
    try {
      const response = await fetch(`${apiUrl}/api/admin/updateStatus`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matchId: actualMatchId,
          status: 'inplay'
        })
      });

      const data = await response.json();
      if (response.ok) {
        setMessage({ text: 'Match started successfully', isError: false });
        fetchExistingMatches();
      } else {
        setMessage({ text: data.message || 'Error starting match', isError: true });
      }
    } catch (error) {
      setMessage({ text: 'Failed to start match', isError: true });
    }
  };

  const handleDeleteMatch = async (matchId) => {
    try {
      const response = await fetch(`${apiUrl}/api/admin/delete-match/${matchId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (response.ok) {
        setMessage({ 
          text: `Match deleted successfully. ${data.gamesDeleted} user games were affected and refunded.`, 
          isError: false 
        });
        setDeletionConfirm(null);
        fetchExistingMatches();
      } else {
        setMessage({ text: data.message || 'Error deleting match', isError: true });
      }
    } catch (error) {
      setMessage({ text: 'Failed to delete match', isError: true });
    }
  };

  const declareWinner = async () => {
    try {
      console.log('Submitting scores for match:', selectedMatchForResult._id);
      const response = await fetch(`${apiUrl}/api/admin/update-match-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: selectedMatchForResult._id,
          homeScore,
          awayScore
        })
      });

      const data = await response.json();
      if (response.ok) {
        setMessage({ text: 'Winner declared successfully', isError: false });
        fetchExistingMatches();
        setSelectedMatchForResult(null);
      } else {
        setMessage({ text: data.message || 'Error declaring winner', isError: true });
      }
    } catch (error) {
      console.error('Failed to declare winner:', error);
      setMessage({ text: 'Failed to declare winner', isError: true });
    }
  };

  const handleCustomMatchSubmit = async () => {
    if (!customHomeTeam || !customAwayTeam || !customMatchDateTime) {
      setMessage({ text: 'Please fill all required fields', isError: true });
      return;
    }

    try {
      const matchToCreate = {
        homeTeam: customHomeTeam,
        awayTeam: customAwayTeam,
        matchDate: new Date(customMatchDateTime),
        isTemplate: true
      };

      const response = await fetch(`${apiUrl}/api/admin/create-matches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matches: [matchToCreate] })
      });

      const data = await response.json();
      if (response.ok) {
        setMessage({ text: 'Custom match template created successfully', isError: false });
        setShowCustomMatchModal(false);
        setCustomHomeTeam('');
        setCustomAwayTeam('');
        setCustomMatchDateTime('');
        fetchExistingMatches();
      } else {
        setMessage({ text: data.message || 'Error creating match', isError: true });
      }
    } catch (error) {
      setMessage({ text: 'Failed to create match', isError: true });
    }
  };

  const handleDeclareResults = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/admin/declare-template-results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: selectedTemplateForResult._id,
          homeScore,
          awayScore
        })
      });

      const data = await response.json();
      if (response.ok) {
        setMessage({ text: 'Results declared and winnings distributed successfully', isError: false });
        setSelectedTemplateForResult(null);
        setHomeScore('');
        setAwayScore('');
        fetchExistingMatches();
      } else {
        setMessage({ text: data.message || 'Error declaring results', isError: true });
      }
    } catch (error) {
      console.error('Failed to declare results:', error);
      setMessage({ text: 'Failed to declare results', isError: true });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <FaFutbol className="text-3xl text-blue-500" />
        <h1 className={styles.title}>Match Management</h1>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>House Profits</h2>
        <div className={styles.statGrid}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Total Commission</div>
            <div className={styles.statValue}>
              {houseProfits.totalCommission.toFixed(2)} ETB
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Completed Matches</div>
            <div className={styles.statValue}>{houseProfits.totalMatches}</div>
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={() => setShowProfitDetails(!showProfitDetails)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <span className="text-sm font-medium">
              {showProfitDetails ? 'Hide' : 'Show'} Recent Profit Details
            </span>
            <svg
              className={`w-4 h-4 transform transition-transform ${
                showProfitDetails ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showProfitDetails && (
            <div className="mt-4 space-y-4">
              {houseProfits.matchDetails.slice(0, 5).map((match, index) => (
                <div key={match.matchId} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div>
                      <div className={styles.cardTitle}>{match.teams}</div>
                      <div className="text-sm text-gray-400">
                        {new Date(match.date).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-400">
                        +{match.commission.toFixed(2)} ETB
                      </div>
                      <div className="text-sm text-gray-400">
                        Pool: {match.totalPool.toFixed(2)} ETB
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AdminBalanceSection users={users} setMessage={setMessage} />

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Create Match Template</h2>
        <div className="flex gap-4 flex-wrap">
          <select 
            value={selectedLeague}
            onChange={handleLeagueChange}
            className={styles.input}
          >
            <option value="">Select a League</option>
            {leagues.map(league => (
              <option key={league.id} value={league.id}>
                {league.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowCustomMatchModal(true)}
            className={`${styles.button} bg-green-600 hover:bg-green-700 text-white`}
          >
            <FaPlus className="inline mr-2" />
            Add Custom Match
          </button>
        </div>

        <div className="mt-6">
          {matchesFromAPI.map(match => {
            const isExisting = existingMatches.some(m => m.apiId === match.id);
            const isSelected = selectedMatches.some(m => m.id === match.id);
            
            return (
              <div 
                key={match.id}
                className={`${styles.card} ${
                  isSelected ? 'border-2 border-blue-500' : ''
                } ${isExisting ? 'opacity-50' : 'cursor-pointer'}`}
                onClick={() => !isExisting && toggleMatchSelection(match)}
              >
                <div className={styles.cardHeader}>
                  <div>
                    <div className={styles.cardTitle}>
                      {match.homeTeam.name} vs {match.awayTeam.name}
                    </div>
                    <div className="text-sm text-gray-400">
                      {new Date(match.utcDate).toLocaleString()}
                    </div>
                  </div>
                  {isExisting ? (
                    <span className="text-green-500">Added</span>
                  ) : (
                    <FaCheck className={`text-xl ${
                      isSelected ? 'text-blue-500' : 'text-gray-600'
                    }`} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Active Templates</h2>
        {existingMatches.map(template => (
          <div key={template._id} className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <div className={styles.cardTitle}>
                  {template.homeTeam} vs {template.awayTeam}
                </div>
                <div className="text-sm text-gray-400">
                  {new Date(template.matchDate).toLocaleString()}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedTemplateForResult(template)}
                  className={`${styles.button} bg-orange-600 hover:bg-orange-700`}
                  title="Declare Results"
                >
                  <FaStop />
                </button>
                <button
                  onClick={() => setDeletionConfirm(template)}
                  className={`${styles.button} bg-red-600 hover:bg-red-700`}
                  title="Delete Template"
                >
                  <FaTrash />
                </button>
              </div>
            </div>

            <div className={styles.statGrid}>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Active Games</div>
                <div className={styles.statValue}>{template.stats?.activeGames || 0}</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Total Users</div>
                <div className={styles.statValue}>{template.stats?.totalUsers || 0}</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Total Stakes</div>
                <div className={styles.statValue}>
                  {template.stats?.totalStakes ? `${template.stats.totalStakes.toFixed(2)} ETB` : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedMatches.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              {selectedMatches.length} matches selected
              <button 
                onClick={createSelectedMatches}
                className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Create Templates
              </button>
            </div>
            <button
              onClick={() => setSelectedMatches([])}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {showCustomMatchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-bold mb-4">Create Custom Match</h3>
            <input
              type="text"
              value={customHomeTeam}
              onChange={(e) => setCustomHomeTeam(e.target.value)}
              placeholder="Home Team"
              className="w-full p-2 border rounded mb-4"
            />
            <input
              type="text"
              value={customAwayTeam}
              onChange={(e) => setCustomAwayTeam(e.target.value)}
              placeholder="Away Team"
              className="w-full p-2 border rounded mb-4"
            />
            <input
              type="datetime-local"
              value={customMatchDateTime}
              onChange={(e) => setCustomMatchDateTime(e.target.value)}
              className="w-full p-2 border rounded mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCustomMatchSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Create Template Match
              </button>
              <button
                onClick={() => setShowCustomMatchModal(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedTemplateForResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-bold mb-4">Declare Match Results</h3>
            <p className="text-sm text-gray-600 mb-4">
              {selectedTemplateForResult.homeTeam} vs {selectedTemplateForResult.awayTeam}
            </p>
            <div className="flex gap-4 mb-4">
              <input
                type="number"
                value={homeScore}
                onChange={(e) => setHomeScore(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Home score"
              />
              <input
                type="number"
                value={awayScore}
                onChange={(e) => setAwayScore(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Away score"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDeclareResults}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Submit Results
              </button>
              <button
                onClick={() => setSelectedTemplateForResult(null)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {deletionConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-bold mb-4">Confirm Deletion</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete the match between {deletionConfirm.homeTeam} and {deletionConfirm.awayTeam}?
            </p>
            <p className="text-sm text-red-600 mb-4">
              This will delete all user games created from this template and refund their bets.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleDeleteMatch(deletionConfirm._id)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={() => setDeletionConfirm(null)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;