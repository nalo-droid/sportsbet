import React, { useState, useEffect } from 'react';
import { FaFutbol, FaPlus, FaCheck, FaPlay, FaTrash, FaCog, FaStop, FaChartLine, FaList } from 'react-icons/fa';
import apiUrl from './apiUrl';
import AdminBalanceSection from './AdminBalanceSection';

const FOOTBALL_API_URL = 'https://api.football-data.org/v4';

// Update the styles object at the top
const styles = {
  container: "min-h-screen bg-gradient-to-b from-[#1a1b26] to-[#24273a] text-white p-4 sm:p-6",
  header: "flex items-center gap-3 mb-8 bg-[#2a2b36] p-4 rounded-lg shadow-lg",
  title: "text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600",
  section: "bg-[#2a2b36] rounded-lg p-4 sm:p-6 mb-6 shadow-lg border border-gray-700/50",
  sectionTitle: "text-lg sm:text-xl font-bold mb-4 flex items-center gap-2",
  input: "w-full p-3 bg-[#1a1b26] border border-gray-700 rounded-lg text-white mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all",
  button: "px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2",
  card: "bg-[#2a2b36] rounded-lg p-3 sm:p-4 mb-4 hover:shadow-xl transition-all duration-300 border border-gray-700/50",
  cardHeader: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3",
  cardTitle: "text-sm sm:text-base font-semibold",
  cardStatus: "px-2 py-1 rounded-full text-xs sm:text-sm",
  statGrid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4",
  statCard: "bg-[#1a1b26] p-4 rounded-lg hover:shadow-lg transition-all duration-300 border border-gray-700/30",
  statLabel: "text-xs sm:text-sm text-gray-400",
  statValue: "text-base sm:text-lg font-bold text-green-400 mt-1",
  teamContainer: "flex items-center gap-2 flex-shrink-0",
  teamLogo: "w-6 h-6 sm:w-8 sm:h-8 object-contain",
  teamName: "text-xs sm:text-sm truncate max-w-[100px] sm:max-w-[150px] lg:max-w-[200px]",
  matchTeamsContainer: "flex items-center justify-between gap-2 w-full flex-wrap sm:flex-nowrap",
  vsText: "text-gray-400 text-xs sm:text-sm px-2",
  matchCard: "bg-[#2a2b36] rounded-lg p-3 sm:p-4 mb-4 hover:transform hover:scale-[1.01] transition-all duration-300",
  actionButton: "text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2 rounded-lg transition-colors duration-200",
};

// Add these new style classes for the floating action bar
const floatingActionBar = "fixed bottom-0 left-0 right-0 bg-[#1a1b26] border-t border-gray-700 p-4 backdrop-blur-lg bg-opacity-90 z-50 transform transition-transform duration-300";
const actionBarContent = "max-w-4xl mx-auto flex items-center justify-between gap-4";

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
      const matchesWithLogos = data.matches.map(match => ({
        ...match,
        homeTeamLogo: match.homeTeam.crest,
        awayTeamLogo: match.awayTeam.crest
      }));
      setMatchesFromAPI(matchesWithLogos);
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
      console.log('Raw selected matches:', JSON.stringify(selectedMatches, null, 2));

      const matchesToCreate = selectedMatches.map(match => {
        console.log('Processing match:', match);
        console.log('Home team data:', match.homeTeam);
        console.log('Away team data:', match.awayTeam);

        // Ensure we're sending exactly what the server expects
        const matchData = {
          homeTeam: match.homeTeam.name || match.homeTeam,  // Handle both object and string cases
          awayTeam: match.awayTeam.name || match.awayTeam,  // Handle both object and string cases
          homeTeamLogo: match.homeTeam.crest || match.homeTeamLogo,  // Handle both object and string cases
          awayTeamLogo: match.awayTeam.crest || match.awayTeamLogo,  // Handle both object and string cases
          matchDate: match.utcDate || match.matchDate,  // Handle both cases
          apiId: match.id,
          isTemplate: true,
          status: 'active'
        };

        // Validate required fields
        if (!matchData.homeTeam || !matchData.awayTeam) {
          throw new Error('Home team and away team are required');
        }

        console.log('Created match data:', matchData);
        return matchData;
      });

      // Important: Send the data wrapped in a matches array
      const requestData = { matches: matchesToCreate };
      console.log('Sending request data:', JSON.stringify(requestData, null, 2));

      const response = await fetch(`${apiUrl}/api/admin/create-matches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();
      console.log('Server response:', data);

      if (response.ok) {
        setMessage({ text: `Successfully created ${data.createdCount} template matches`, isError: false });
        setSelectedMatches([]);
        fetchExistingMatches();
      } else {
        setMessage({ 
          text: data.error || data.message || 'Error creating matches', 
          isError: true 
        });
      }
    } catch (error) {
      console.error('Error creating matches:', error);
      setMessage({ text: error.message || 'Failed to create matches', isError: true });
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
        <FaFutbol className="text-2xl sm:text-3xl text-blue-500" />
        <h1 className={styles.title}>Match Management</h1>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <FaChartLine className="text-green-400" />
          House Profits
        </h2>
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
        <h2 className={styles.sectionTitle}>
          <FaPlus className="text-blue-400" />
          Create Match Template
        </h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <select 
            value={selectedLeague}
            onChange={handleLeagueChange}
            className={`${styles.input} flex-grow`}
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
            className={`${styles.button} bg-green-600 hover:bg-green-700 whitespace-nowrap`}
          >
            <FaPlus className="text-sm" />
            <span>Custom Match</span>
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  <div className={styles.matchTeamsContainer}>
                    <div className={styles.teamContainer}>
                      {match.homeTeamLogo && (
                        <img 
                          src={match.homeTeamLogo} 
                          alt={match.homeTeam.name}
                          className={styles.teamLogo}
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      )}
                      <span className={styles.teamName}>{match.homeTeam.name}</span>
                    </div>
                    <span className={styles.vsText}>vs</span>
                    <div className={styles.teamContainer}>
                      {match.awayTeamLogo && (
                        <img 
                          src={match.awayTeamLogo} 
                          alt={match.awayTeam.name}
                          className={styles.teamLogo}
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      )}
                      <span className={styles.teamName}>{match.awayTeam.name}</span>
                    </div>
                  </div>
                </div>
                <div className="text-xs sm:text-sm text-gray-400 mt-2">
                  {new Date(match.utcDate).toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <FaList className="text-purple-400" />
          Active Templates
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {existingMatches.map(template => (
            <div key={template._id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.matchTeamsContainer}>
                  <div className={styles.teamContainer}>
                    {template.homeTeamLogo && (
                      <img 
                        src={template.homeTeamLogo} 
                        alt={template.homeTeam}
                        className={styles.teamLogo}
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    )}
                    <span className={styles.teamName}>{template.homeTeam}</span>
                  </div>
                  <span className={styles.vsText}>vs</span>
                  <div className={styles.teamContainer}>
                    {template.awayTeamLogo && (
                      <img 
                        src={template.awayTeamLogo} 
                        alt={template.awayTeam}
                        className={styles.teamLogo}
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    )}
                    <span className={styles.teamName}>{template.awayTeam}</span>
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
      </div>

      {selectedMatches.length > 0 && (
        <div className={floatingActionBar}>
          <div className={actionBarContent}>
            <div className="flex items-center gap-4">
              <span className="text-sm sm:text-base">
                {selectedMatches.length} matches selected
              </span>
              <button 
                onClick={createSelectedMatches}
                className={`${styles.button} bg-blue-600 hover:bg-blue-700`}
              >
                <FaPlus className="text-sm" />
                <span>Create Templates</span>
              </button>
            </div>
            <button
              onClick={() => setSelectedMatches([])}
              className={`${styles.button} bg-gray-600 hover:bg-gray-700`}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {showCustomMatchModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#2a2b36] p-6 rounded-lg w-full max-w-md border border-gray-700/50">
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