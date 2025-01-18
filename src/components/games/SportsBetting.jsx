import React, { useEffect, useState } from 'react';
import Button from '../common/Button';
import apiUrl from '../../apiUrl';

const SportsBetting = () => {
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState(null);
  const [bets, setBets] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [filter, setFilter] = useState({ league: '', date: '', team: '' });
  const [leagues, setLeagues] = useState([]);
  const [teams, setTeams] = useState([]);
  const [stake, setStake] = useState(100);
  const [acceptStake, setAcceptStake] = useState(100);
  const houseCommission = 0.1;

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await fetch(`${apiUrl}/matches`);
        const data = await response.json();
        setMatches(data);
        setLeagues([...new Set(data.map(match => match.strLeague))]);
        setTeams([...new Set(data.flatMap(match => [match.strHomeTeam, match.strAwayTeam]))]);
      } catch (error) {
        setError(error.message);
      }
    };

    const fetchBets = async () => {
      try {
        const response = await fetch(`${apiUrl}/bets`);
        const data = await response.json();
        setBets(data);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchMatches();
    fetchBets();
  }, []);

  const createBet = async (matchId, betType, amount) => {
    try {
      const response = await fetch(`${apiUrl}/create-bet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: 'UserA',
          matchId,
          betType,
          amount,
        }),
      });
      const data = await response.json();
      setBets([...bets, data]);
    } catch (error) {
      setError(error.message);
    }
  };

  const acceptBet = async (betId, betType, amount) => {
    try {
      const response = await fetch(`${apiUrl}/accept-bet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          betId,
          user: 'UserB',
          betType,
          amount,
        }),
      });
      const data = await response.json();
      setBets(bets.map(bet => (bet._id === betId ? data : bet)));
    } catch (error) {
      setError(error.message);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter({ ...filter, [name]: value });
  };

  const handleStakeChange = (e) => {
    setStake(e.target.value);
  };

  const handleAcceptStakeChange = (e) => {
    setAcceptStake(e.target.value);
  };

  const filteredMatches = matches.filter(match => {
    return (
      (filter.league ? match.strLeague === filter.league : true) &&
      (filter.date ? match.dateEvent === filter.date : true) &&
      (filter.team ? match.strHomeTeam === filter.team || match.strAwayTeam === filter.team : true)
    );
  });

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="w-full mx-auto bg-gradient-to-br from-gray-900 to-gray-800 min-h-screen text-white">
      <h2 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">Sports Betting</h2>
      {error && <p className="text-red-500 mb-4">Error: {error}</p>}
      <div className="mb-6 flex flex-wrap gap-4 justify-center">
        <select
          name="league"
          value={filter.league}
          onChange={handleFilterChange}
          className="p-2 border rounded text-white bg-gray-800 border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Filter by league</option>
          {leagues.map((league, index) => (
            <option key={index} value={league}>{league}</option>
          ))}
        </select>
        <input
          type="date"
          name="date"
          value={filter.date}
          onChange={handleFilterChange}
          min={today}
          className="p-2 border rounded text-white bg-gray-800 border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          name="team"
          value={filter.team}
          onChange={handleFilterChange}
          className="p-2 border rounded text-white bg-gray-800 border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Filter by team</option>
          {teams.map((team, index) => (
            <option key={index} value={team}>{team}</option>
          ))}
        </select>
      </div>
      <div className="lg:hidden mb-6 bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
        <label htmlFor="stake" className="block mb-2 text-lg font-medium text-blue-300">Stake Amount:</label>
        <input
          id="stake"
          type="number"
          value={stake}
          onChange={handleStakeChange}
          className="p-2 border rounded text-white bg-gray-700 border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
        />
      </div>
      <div className="flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-4 p-4">
        <div className="lg:w-1/5 bg-gray-800 rounded-lg shadow-lg border border-gray-700 flex flex-col">
          <h3 className="text-2xl font-bold p-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 border-b border-gray-700">Winners</h3>
          <div className="overflow-y-auto flex-grow p-6 custom-scrollbar">
            {/* Add winner dashboard content here */}
          </div>
        </div>
        <div className="lg:w-2/5 bg-gray-800 rounded-lg shadow-lg border border-gray-700 flex flex-col">
          <h3 className="text-2xl font-bold p-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 border-b border-gray-700">Available Matches</h3>
          <div className="overflow-y-auto flex-grow p-6 custom-scrollbar">
            {filteredMatches.map(match => (
              <div key={match.idEvent} className="bg-gray-700 rounded-lg p-6 mb-6 shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-600">
                <div className="text-xl font-medium mb-4 text-blue-300">
                  {match.strHomeTeam} vs {match.strAwayTeam}
                </div>
                <div className="text-lg mb-4 text-gray-400">
                  {match.dateEvent} at {match.strTime}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Button onClick={() => createBet(match.idEvent, 'home', stake)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300 lg:py-1 lg:px-2 text-sm">Home</Button>
                  <Button onClick={() => createBet(match.idEvent, 'draw', stake)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300 lg:py-1 lg:px-2 text-sm">Draw</Button>
                  <Button onClick={() => createBet(match.idEvent, 'away', stake)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300 lg:py-1 lg:px-2 text-sm">Away</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:w-2/5 bg-gray-800 rounded-lg shadow-lg border border-gray-700 flex flex-col">
          <div className="hidden lg:block bg-gray-800 rounded-lg p-6 shadow-lg border-b border-gray-700">
            <label htmlFor="stake" className="block mb-2 text-lg font-medium text-blue-300">Stake Amount:</label>
            <input
              id="stake"
              type="number"
              value={stake}
              onChange={handleStakeChange}
              className="p-2 border rounded text-white bg-gray-700 border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
          </div>
          <h3 className="text-2xl font-bold p-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 border-b border-gray-700">Bets</h3>
          <div className="overflow-y-auto flex-grow p-6 custom-scrollbar">
            {bets.map(bet => (
              <div key={bet._id} className="bg-gray-700 rounded-lg p-6 mb-6 shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-600">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                  <div className="text-xl font-medium mb-2 sm:mb-0">
                    Bet ID: {bet._id} - {bet.betType} - {bet.amount}
                  </div>
                  {bet.status === 'pending' && (
                    <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
                      <input
                        type="number"
                        value={acceptStake}
                        onChange={handleAcceptStakeChange}
                        className="p-2 border rounded text-white bg-gray-800 border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <select
                        name="betType"
                        onChange={(e) => acceptBet(bet._id, e.target.value, acceptStake)}
                        className="p-2 border rounded text-white bg-gray-800 border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="home">Home</option>
                        <option value="draw">Draw</option>
                        <option value="away">Away</option>
                      </select>
                      <Button onClick={() => acceptBet(bet._id, bet.betType, acceptStake)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300 lg:py-1 lg:px-2 text-sm">Accept Bet</Button>
                    </div>
                  )}
                </div>
                {bet.status === 'accepted' && (
                  <div className="text-lg mt-2">
                    <p>Your Stake: {bet.user === 'UserA' ? bet.amount : bet.acceptedAmount}</p>
                    <p>Winning Amount: {(bet.amount + bet.acceptedAmount) * (1 - houseCommission)}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SportsBetting;

