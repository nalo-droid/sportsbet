import React, { useState, useEffect } from 'react';
import { FaFutbol, FaPlus, FaCheck, FaPlay, FaTrash, FaCog } from 'react-icons/fa';
import apiUrl from './apiUrl';

const FOOTBALL_API_URL = 'https://api.football-data.org/v4';

function Admin() {
  const [selectedMatches, setSelectedMatches] = useState([]);
  const [matchesFromAPI, setMatchesFromAPI] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState('');
  const [stakeAmount, setStakeAmount] = useState('');
  const [message, setMessage] = useState({ text: '', isError: false });
  const [existingMatches, setExistingMatches] = useState([]);
  const [showStakeModal, setShowStakeModal] = useState(false);
  const [footballApiKey, setFootballApiKey] = useState('');
  const [selectedMatchForResult, setSelectedMatchForResult] = useState(null);
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [matchDateTime, setMatchDateTime] = useState('');
  const [showCustomMatchModal, setShowCustomMatchModal] = useState(false);
  const [customHomeTeam, setCustomHomeTeam] = useState('');
  const [customAwayTeam, setCustomAwayTeam] = useState('');
  const [customStake, setCustomStake] = useState('');
  const [customMatchDateTime, setCustomMatchDateTime] = useState('');

  useEffect(() => {
    fetchFootballApiKey();
    fetchLeagues();
    fetchExistingMatches();
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
      const response = await fetch(`${apiUrl}/api/matches/list`);
      const data = await response.json();
      setExistingMatches(data);
    } catch (error) {
      console.error('Error fetching existing matches:', error);
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
    if (!stakeAmount || isNaN(stakeAmount) || !matchDateTime) {
      setMessage({ text: 'Please enter a valid stake amount and match date/time', isError: true });
      return;
    }

    try {
      const matchesToCreate = selectedMatches.map(match => ({
        homeTeam: match.homeTeam.name,
        awayTeam: match.awayTeam.name,
        amount: stakeAmount,
        matchDate: new Date(matchDateTime),
        apiId: match.id
      }));

      const response = await fetch(`${apiUrl}/api/admin/create-matches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matches: matchesToCreate })
      });

      const data = await response.json();
      if (response.ok) {
        setMessage({ text: `${data.createdCount} matches created!`, isError: false });
        setSelectedMatches([]);
        setShowStakeModal(false);
        fetchExistingMatches();
      } else {
        setMessage({ text: data.message || 'Error creating matches', isError: true });
      }
    } catch (error) {
      setMessage({ text: 'Failed to create matches', isError: true });
    }
  };

  const handleStartGame = async (matchId) => {
    try {
      const response = await fetch(`${apiUrl}/api/admin/updateStatus`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matchId,
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
        setMessage({ text: 'Match deleted successfully', isError: false });
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <FaFutbol className="text-3xl text-blue-600" />
        <h1 className="text-2xl font-bold">Select Matches from API</h1>
      </div>

      <div className="mb-6 flex gap-4">
        <select 
          value={selectedLeague}
          onChange={handleLeagueChange}
          className="w-full p-2 rounded border border-gray-300"
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
          className="whitespace-nowrap px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          <FaPlus className="inline mr-2" />
          Add Custom Match
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-6">
        {matchesFromAPI.map(match => {
          const isExisting = existingMatches.some(m => m.apiId === match.id);
          const isSelected = selectedMatches.some(m => m.id === match.id);
          
          return (
            <div 
              key={match.id}
              className={`p-4 border rounded-md ${isSelected ? 'bg-blue-50' : 'bg-white'} 
                ${isExisting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              onClick={() => !isExisting && toggleMatchSelection(match)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {match.homeTeam.name} vs {match.awayTeam.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(match.utcDate).toLocaleString('en-US', {
                      timeZone: 'UTC',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZoneName: 'short'
                    })}
                  </p>
                </div>
                {isExisting ? (
                  <span className="text-green-600">Already added</span>
                ) : (
                  <FaCheck className={`text-xl ${isSelected ? 'text-blue-600' : 'text-gray-300'}`} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedMatches.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              {selectedMatches.length} matches selected
              <button 
                onClick={() => setShowStakeModal(true)}
                className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Set Stake Amount
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

      {showStakeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-bold mb-4">Set Stake Amount and Match Date/Time</h3>
            <input
              type="number"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              className="w-full p-2 border rounded mb-4"
              placeholder="Enter stake amount in ETB"
            />
            <input
              type="datetime-local"
              value={matchDateTime}
              onChange={(e) => setMatchDateTime(e.target.value)}
              className="w-full p-2 border rounded mb-4"
              placeholder="Select match date and time"
            />
            <div className="flex gap-2">
              <button
                onClick={createSelectedMatches}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowStakeModal(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
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
              type="number"
              value={customStake}
              onChange={(e) => setCustomStake(e.target.value)}
              placeholder="Stake Amount"
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
                onClick={async () => {
                  if (!customHomeTeam || !customAwayTeam || !customStake || isNaN(customStake) || !customMatchDateTime) {
                    setMessage({ text: 'Please fill all fields correctly', isError: true });
                    return;
                  }

                  try {
                    const matchToCreate = {
                      homeTeam: customHomeTeam,
                      awayTeam: customAwayTeam,
                      amount: customStake,
                      matchDate: new Date(customMatchDateTime)
                    };

                    const response = await fetch(`${apiUrl}/api/admin/create-matches`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ matches: [matchToCreate] })
                    });

                    const data = await response.json();
                    if (response.ok) {
                      setMessage({ text: 'Custom match created!', isError: false });
                      setShowCustomMatchModal(false);
                      fetchExistingMatches();
                      setCustomHomeTeam('');
                      setCustomAwayTeam('');
                      setCustomStake('');
                      setCustomMatchDateTime('');
                    } else {
                      setMessage({ text: data.message || 'Error creating match', isError: true });
                    }
                  } catch (error) {
                    setMessage({ text: 'Failed to create match', isError: true });
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Create Match
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

      <div className="mt-6">
        <h2 className="text-xl font-bold mb-4">Existing Matches</h2>
        <div className="grid grid-cols-1 gap-4">
          {existingMatches.map(match => (
            <div key={match._id} className="p-4 border rounded-md bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {match.homeTeam} vs {match.awayTeam}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(match.matchDate).toLocaleString('en-US', {
                      timeZone: 'UTC',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZoneName: 'short'
                    })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStartGame(match._id)}
                    className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    <FaPlay />
                  </button>
                  <button
                    onClick={() => setSelectedMatchForResult(match)}
                    className="px-2 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
                  >
                    Declare Winner
                  </button>
                  <button
                    onClick={() => handleDeleteMatch(match._id)}
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedMatchForResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-bold mb-4">Declare Match Result</h3>
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
                onClick={declareWinner}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Submit Result
              </button>
              <button
                onClick={() => setSelectedMatchForResult(null)}
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