import React, { useEffect, useState } from 'react';
import Header from './Header';
import apiUrl from './apiUrl';
import useUserProfile from '../hooks/useUserProfile';
import AllBets from './AllBets';
import MyTransactions from './Mytransactions';

const SportsBetting = () => {
  const [error, setError] = useState(null);
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeTab, setActiveTab] = useState('events');
  const [isGameStarted, setIsGameStarted] = useState(false);
  const user = useUserProfile();

  // Add these new states at the top with other states
  const [historicData, setHistoricData] = useState(null);
  const [historicDataLoading, setHistoricDataLoading] = useState(false);
  const [historicDataError, setHistoricDataError] = useState(null);

  useEffect(() => {
    const fetchBets = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/matches/list`);
        const data = await response.json();
        setBets(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBets();
  }, []);

  // Helper function to calculate totals and counts for each bet type
  const calculateTotalsAndCounts = (bets = [], matchAmount) => {
    const result = bets.reduce((acc, bet) => {
      const betType = bet.betType;
      acc.userCounts[betType] = (acc.userCounts[betType] || 0) + 1;
      // Calculate total amount for each bet type by multiplying count by match amount
      acc.totals[betType] = acc.userCounts[betType] * matchAmount;
      return acc;
    }, {
      totals: { home: 0, draw: 0, away: 0 },
      userCounts: { home: 0, draw: 0, away: 0 }
    });

    // Calculate total pool by summing all bet type totals
    result.totalPool = Object.values(result.totals).reduce((sum, amount) => sum + amount, 0);
    
    return result;
  };

  // Helper function to calculate possible win for a specific bet
  const calculatePossibleWin = (betType, amount, totals, userCounts, totalPool) => {
    if (totals[betType] === 0) return 0;
    // Calculate the proportion of the total bet type amount that this bet represents
    const proportion = amount / totals[betType];
    // Multiply the total pool by the proportion
    return (totalPool * proportion).toFixed(2);
  };

  
  const handleBetClick = async (betType, matchId) => {
    if (!user?._id) {
      alert('Please login to place a bet');
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/bets/place-bet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          matchId,
          userId: user._id,
          betType
        })
      });

      const data = await response.json();
      if (response.ok) {
        // Bet placed successfully
        alert('Bet placed successfully!');
        window.location.reload(); // Reload the page
      } else {
        alert(data.error || 'Failed to place bet');
      }
    } catch (error) {
      console.error('Error placing bet:', error);
      alert('An error occurred while placing the bet');
    }
  };

  // Add this new function
  const logMatchDetails = async (match) => {
    setSelectedMatch(match);
    setAnalysisLoading(true);
    setHistoricDataLoading(true);
    setAnalysis(null);
    setHistoricData(null);
    setHistoricDataError(null);

    const prompt = `who would win the soccer match between ${match.homeTeam} and ${match.awayTeam}, not predict just guess short detail. and explain why`;

    try {
        const response = await fetch(`${apiUrl}/api/gemini/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                prompt,
                homeTeam: match.homeTeam,
                awayTeam: match.awayTeam
            }),
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch analysis');
        }
        
        const data = await response.json();
        if (data.error) {
            throw new Error(data.error);
        }
        
        setAnalysis(data);
        setHistoricData(data.historicalAnalysis);
    } catch (error) {
        console.error('Error fetching analysis:', error);
        setAnalysis({ error: error.message });
        setHistoricDataError(error.message);
    } finally {
        setAnalysisLoading(false);
        setHistoricDataLoading(false);
    }
  };

  // Add this function to close the modal
  const closeModal = () => {
    setSelectedMatch(null);
  };

  // Add this new function to handle text-to-speech
  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(analysis.response);
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      
      if (isSpeaking) {
        window.speechSynthesis.cancel();
      } else {
        window.speechSynthesis.speak(utterance);
      }
    } else {
      alert('Text-to-speech is not supported in your browser');
    }
  };

  // Add this new function in your SportsBetting component
  const handleCancelBet = async (matchId) => {
    if (!user?._id) return;
    
    try {
      const response = await fetch(`${apiUrl}/api/bets/cancel-bet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matchId,
          userId: user._id
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel bet');
      }

      const data = await response.json();
      
      // Update the local state with the new data
      setBets(prevBets => prevBets.map(bet => 
        bet._id === matchId ? data.updatedMatch : bet
      ));

      // Show success message
      alert('Bet cancelled successfully!');
      
    } catch (error) {
      console.error('Error cancelling bet:', error);
      alert(error.message);
    }
  };

  // Filter bets to only show user's bets in "My Bets" tab
  const userBets = bets.filter(bet => 
    bet.bets?.some(userBet => userBet.userId._id === user?._id)
  );

  return (
    <div>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4">
        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6 justify-center">
          <button 
            className={`px-4 py-2 rounded-lg ${activeTab === 'events' ? 'bg-blue-600 text-white' : 'bg-gray-700'}`}
            onClick={() => setActiveTab('events')}
          >
            Events
          </button>
          <button 
            className={`px-4 py-2 rounded-lg ${activeTab === 'bets' ? 'bg-blue-600 text-white' : 'bg-gray-700'}`}
            onClick={() => setActiveTab('bets')}
          >
            My Bets
          </button>
          <button 
            className={`px-4 py-2 rounded-lg ${activeTab === 'transactions' ? 'bg-blue-600 text-white' : 'bg-gray-700'}`}
            onClick={() => setActiveTab('transactions')}
          >
            Transactions
          </button>
        </div>

        {activeTab === 'events' && (
          <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Main Betting Section */}
            <div className="w-full lg:w-3/5 bg-gray-800 rounded-lg shadow-lg border border-gray-700 flex flex-col">
              <h3 className="text-xl lg:text-2xl font-bold p-4 lg:p-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 border-b border-gray-700">Active Bets</h3>
              <div className="overflow-y-auto flex-grow p-4 lg:p-6 custom-scrollbar space-y-4 lg:space-y-6">
                {bets && bets.length > 0 ? (
                  bets.map(match => {
                    const { totals, userCounts, totalPool } = calculateTotalsAndCounts(match.bets, match.amount);
                    const userBet = match.bets?.find(b => b.userId._id === user?._id);

                    return (
                      <div key={match._id} className="bg-gray-700 rounded-lg p-3 lg:p-6 shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-600">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-lg font-medium text-blue-300">
                            {match.homeTeam} vs {match.awayTeam}
                          </div>
                          <span className={`px-2 py-1 rounded text-sm ${
                            match.status === 'completed' ? 'bg-green-600' :
                            match.status === 'inplay' ? 'bg-yellow-600' :
                            'bg-gray-600'
                          }`}>
                            {match.status?.toUpperCase()}
                          </span>
                        </div>
                        {/* Add date display */}
                        <div className="text-sm text-gray-400 mb-2">
                          Match Date: {match.matchDate ? new Date(match.matchDate).toLocaleString('en-US', {
                            timeZone: 'UTC',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            timeZoneName: 'short'
                          }) : 'Date not available'}
                        </div>

                        {/* Total Pool Display */}
                        <div className="text-center p-2 bg-gray-800 rounded-t-lg text-sm">
                          <span className="text-purple-400 font-semibold">Total Pool: </span>
                          <span className="text-gray-300">{totalPool} ETB</span>
                        </div>
                        <div className="text-center p-2 bg-gray-800 rounded-t-lg text-sm">
                          <span className="text-purple-400 font-semibold">Stake Amount: </span>
                          <span className="text-gray-300">{match.amount} ETB</span>
                        </div>

                        {/* Betting options */}
                        <div className="grid grid-cols-3 gap-2 lg:gap-4 p-2 lg:p-3 bg-gray-800 rounded-b-lg text-sm">
                          {['home', 'draw', 'away'].map(betType => (
                            <button
                              key={`${match._id}-${betType}`}
                              onClick={() => handleBetClick(betType, match._id)}
                              disabled={userBet !== undefined || match.status !== 'active'}
                              className={`text-center p-2 hover:bg-gray-700 rounded transition-colors ${
                                userBet?.betType === betType ? 'bg-blue-900' : ''
                              } ${match.status !== 'active' ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <div className="text-blue-400 font-semibold">
                                {betType.charAt(0).toUpperCase() + betType.slice(1)}
                              </div>
                              <div className="text-gray-300">{totals[betType]} ETB</div>
                              <div className="text-xs text-gray-400">
                                {userCounts[betType]} {userCounts[betType] === 1 ? 'bet' : 'bets'}
                              </div>
                            </button>
                          ))}
                        </div>

                        {/* AI Analysis button */}
                        <button
                          onClick={() => logMatchDetails(match)}
                          className="mt-3 w-full py-2 px-4 bg-gray-800 hover:bg-gray-900 rounded-lg text-sm text-blue-400 transition-colors"
                        >
                          AI Analysis
                        </button>

                        {match.status === 'completed' && (
                          <div className="mt-2 p-2 bg-gray-800 rounded">
                            <div className="text-center text-lg font-bold">
                              {match.scoreHome} - {match.scoreAway}
                            </div>
                            <div className="text-center text-sm text-gray-400">
                              Winner: {match.winnerTeam}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-400 text-sm">No bets available.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && <MyTransactions />}
        {activeTab === 'bets' && (
          <div className="w-full lg:w-2/5 bg-gray-800 rounded-lg shadow-lg border border-gray-700 flex flex-col">
            <h3 className="text-xl lg:text-2xl font-bold p-4 lg:p-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 border-b border-gray-700">Your Betslips</h3>
            <div className="overflow-y-auto flex-grow p-4 lg:p-6 custom-scrollbar space-y-4">
              {userBets.map(bet => {
                const userBet = bet.bets.find(b => b.userId._id === user?._id);
                if (!userBet) return null;

                const { totals, userCounts, totalPool } = calculateTotalsAndCounts(bet.bets || [], bet.amount);

                return (
                  <div key={bet._id} className="bg-gray-700 rounded-lg p-4 shadow-md border border-gray-600">
                    <div className="text-sm font-medium mb-2 text-blue-300">
                      {bet.homeTeam} vs {bet.awayTeam}
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3 text-sm border-l-4 border-blue-500">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-gray-400">
                          Bet: {userBet.betType} ({userBet.amount} ETB)
                        </div>
                        <div className="text-green-400">
                          Win: {calculatePossibleWin(userBet.betType, bet.amount, totals, userCounts, totalPool)} ETB
                        </div>
                      </div>
                      <button
                        onClick={() => handleCancelBet(bet._id)}
                        className={`mt-2 w-full py-1 px-2 rounded text-white text-xs transition-colors ${
                          bet.status === 'inplay' ? 'bg-gray-500 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'
                        }`}
                        disabled={bet.status === 'inplay'}
                      >
                        Cancel Bet
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Add the modal */}
      {selectedMatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full border border-gray-700 shadow-xl max-h-[80vh] flex flex-col">


            <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
              <div className="space-y-3">
                <div className="flex justify-between items-center mb-4">
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Analysis Section */}
                <div className="mt-4 border-t border-gray-700 pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-lg font-semibold text-blue-400">Match Analysis</h4>
                    {analysis && !analysis.error && (
                      <button
                        onClick={handleSpeak}
                        className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                        title={isSpeaking ? "Stop speaking" : "Read analysis"}
                      >
                        {isSpeaking ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1V10a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1V10a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                  {analysisLoading ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                      <span className="ml-3 text-blue-400">Generating analysis...</span>
                    </div>
                  ) : analysis ? (
                    <>
                      {/* AI Response */}
                      <div className="text-gray-300 p-3 bg-gray-700 rounded-lg whitespace-pre-wrap mb-4">
                        {analysis.response}
                      </div>

                      {/* Historic Analysis Section */}
                      <div className="space-y-6 mt-6">
                        {/* Performance Trends */}
                        <div className="bg-gray-700 p-4 rounded-lg">
                          <h5 className="text-blue-400 font-semibold mb-3">Historic Performance Trends</h5>
                          {historicDataLoading ? (
                            <div className="flex items-center justify-center p-4">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
                            </div>
                          ) : historicDataError ? (
                            <div className="text-red-400 text-sm">{historicDataError}</div>
                          ) : historicData ? (
                            <div className="flex items-center">
                              <div className="text-2xl font-bold text-green-400">
                                {historicData.performanceTrend}%
                              </div>
                              <div className="ml-2 text-sm text-gray-400">match similarity rate</div>
                            </div>
                          ) : null}
                        </div>

                        {/* Popular Scores */}
                        <div className="bg-gray-700 p-4 rounded-lg">
                          <h5 className="text-blue-400 font-semibold mb-3">Popular Scores in Similar Matches</h5>
                          {historicDataLoading ? (
                            <div className="flex items-center justify-center p-4">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
                            </div>
                          ) : historicDataError ? (
                            <div className="text-red-400 text-sm">{historicDataError}</div>
                          ) : historicData?.popularScores ? (
                            <div className="grid grid-cols-3 gap-4">
                              {historicData.popularScores.map((score, index) => (
                                <div key={index} className="text-center bg-gray-800 p-2 rounded">
                                  <div className="text-xl font-bold text-white">{score.score}</div>
                                  <div className="text-sm text-gray-400">{score.frequency} matches</div>
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </div>

                        {/* Team Power Metrics */}
                        <div className="bg-gray-700 p-4 rounded-lg">
                          <h5 className="text-blue-400 font-semibold mb-3">Universal Team Metrics</h5>
                          {historicDataLoading ? (
                            <div className="flex items-center justify-center p-4">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
                            </div>
                          ) : historicDataError ? (
                            <div className="text-red-400 text-sm">{historicDataError}</div>
                          ) : historicData?.teamMetrics ? (
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-gray-800 p-3 rounded">
                                <div className="text-sm text-gray-400">
                                  {historicData.teamMetrics.homeTeam.label}
                                </div>
                                <div className="text-xl font-bold text-green-400">
                                  +{historicData.teamMetrics.homeTeam.powerIndex}%
                                </div>
                              </div>
                              <div className="bg-gray-800 p-3 rounded">
                                <div className="text-sm text-gray-400">
                                  {historicData.teamMetrics.awayTeam.label}
                                </div>
                                <div className="text-xl font-bold text-green-400">
                                  +{historicData.teamMetrics.awayTeam.powerIndex}%
                                </div>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SportsBetting;
