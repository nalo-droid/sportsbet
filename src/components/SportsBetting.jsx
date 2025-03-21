import React, { useEffect, useState } from 'react';
import Header from './Header';
import apiUrl from './apiUrl';
import useUserProfile from '../hooks/useUserProfile';
import AllBets from './AllBets';
import MyTransactions from './Mytransactions';
import { Link } from 'react-router-dom';

// Update the styles object with darker green colors and better field positioning
const styles = {
  container: `
    min-h-screen 
    bg-[#4CAF50]
    relative 
    overflow-hidden
  `,
  soccerField: `
    fixed 
    inset-0 
    pointer-events-none
    bg-[#4CAF50]
    grass-pattern
    field-ambience
  `,
  fieldLines: `
    absolute 
    top-1/2 
    left-1/2 
    -translate-x-1/2 
    -translate-y-1/2
    w-[90vw]
    h-[90vh]
    max-w-[1200px]
    border-[2px] 
    border-white/80
    rounded-lg
  `,
  centerCircle: `
    absolute
    left-1/2
    top-1/2
    -translate-x-1/2
    -translate-y-1/2
    w-[20%]
    h-[20%]
    border-[2px]
    border-white/80
    rounded-full
  `,
  penaltyBox: `
    absolute
    w-[40%]
    h-[25%]
    border-[2px]
    border-white/80
    bg-[#1a472a]/20
  `,
  goalBox: `
    absolute
    w-[20%]
    h-[40%]
    border-[2px]
    border-white/80
    bg-[#1a472a]/10
  `,
  penaltySpot: `
    absolute
    w-3
    h-3
    rounded-full
    bg-white/80
  `,
  content: `
    relative 
    z-10 
    container 
    mx-auto 
    p-4 
    sm:p-6
  `,
  header: "bg-[#1a472a] bg-gradient-to-b from-[#2ea043]/40 to-[#1a472a] backdrop-blur-md border-t border-[#2ea043]/30 rounded-lg shadow-lg p-4 mb-6",
  userInfo: "bg-gradient-to-r from-[#1a472a] via-[#2ea043]/20 to-[#1a472a] backdrop-blur-sm rounded-lg border border-[#2ea043]/30 p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]",
  userAvatar: "w-12 h-12 rounded-full bg-[#2a2b36] flex items-center justify-center text-xl font-bold",
  userName: "text-lg font-semibold",
  userBalance: "text-green-400 text-sm",
  tabContainer: "bg-gradient-to-b from-[#2ea043]/20 to-[#1a472a] backdrop-blur-sm rounded-lg border border-[#2ea043]/30 p-2 shadow-lg",
  tab: "px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all duration-300",
  activeTab: "bg-gradient-to-r from-[#2ea043] to-[#1a472a] text-white shadow-lg border border-[#2ea043]/50",
  inactiveTab: "bg-gradient-to-r from-[#1a472a]/50 to-[#1a472a]/30 text-white/70 hover:from-[#2ea043]/30 hover:to-[#1a472a]/50",
  matchCard: `
    bg-gradient-to-b from-[#2ea043]/10 to-[#1a472a] 
    backdrop-blur-md 
    rounded-lg 
    p-4 
    mb-4 
    border 
    border-[#2ea043]/30 
    shadow-lg 
    transition-all 
    duration-300 
    hover:shadow-[0_0_15px_rgba(46,160,67,0.2)] 
    hover:from-[#2ea043]/20 
    hover:to-[#1a472a]
    shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]
  `,
  matchHeader: "flex justify-between items-center mb-3",
  matchTeams: "text-lg font-semibold",
  matchStatus: "text-sm px-3 py-1 rounded-full",
  betButton: `
    w-full 
    py-2 
    rounded-lg 
    text-center 
    text-sm 
    font-medium 
    transition-all 
    duration-300 
    bg-gradient-to-b 
    from-[#2ea043]/20 
    to-[#1a472a] 
    hover:from-[#2ea043]/30 
    hover:to-[#1a472a] 
    border 
    border-[#2ea043]/20
    shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]
  `,
  betAmount: "text-xl font-bold text-yellow-400 mb-1",
  betLabel: "text-sm text-gray-400",
  betTypeLabel: "text-xs text-gray-400 mb-1",
  betButtonDisabled: "bg-gray-700 text-gray-500 cursor-not-allowed",
  teamContainer: "flex items-center gap-2",
  teamLogo: "w-6 h-6 object-contain rounded-full bg-white p-[2px]",
  teamName: "text-sm sm:text-base truncate max-w-[120px] sm:max-w-[200px]",
  matchTeamsContainer: "flex items-center justify-between gap-2 w-full",
  vsText: "text-gray-400 text-sm px-2",
  scoreContainer: "flex items-center gap-2",
  resultDetails: "text-sm text-gray-400",
  winnerText: "text-lg font-semibold",
  dateText: "text-sm text-gray-400",
};

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
  const [templateMatches, setTemplateMatches] = useState([]);
  const [userGames, setUserGames] = useState([]);
  const [templateMatchesLoading, setTemplateMatchesLoading] = useState(true);
  const [userGamesLoading, setUserGamesLoading] = useState(true);
  const [completedMatches, setCompletedMatches] = useState([]);
  const [completedMatchesLoading, setCompletedMatchesLoading] = useState(true);

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

  useEffect(() => {
    const fetchTemplateMatches = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/matches/templates`);
        const data = await response.json();
        setTemplateMatches(data);
      } catch (error) {
        console.error('Error fetching template matches:', error);
        setError('Failed to load template matches');
      } finally {
        setTemplateMatchesLoading(false);
      }
    };

    const fetchUserGames = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/matches/user-games`);
        const data = await response.json();
        
        // Filter out games whose templates have been deleted
        const validGames = await Promise.all(
          data.map(async (game) => {
            if (!game.originalTemplate) return game;
            const templateExists = await checkTemplateExists(game.originalTemplate);
            return templateExists ? game : null;
          })
        );

        const filteredGames = validGames.filter(game => game !== null);
        setUserGames(filteredGames);
        setBets(filteredGames);
      } catch (error) {
        console.error('Error fetching user games:', error);
        setError('Failed to load user games');
      } finally {
        setUserGamesLoading(false);
        setLoading(false);
      }
    };

    fetchTemplateMatches();
    fetchUserGames();
  }, []);

  // Helper function to calculate totals and counts for each bet type
  const calculateTotalsAndCounts = (bets = [], matchAmount) => {
    const result = bets.reduce((acc, bet) => {
      const betType = bet.betType;
      acc.userCounts[betType] = (acc.userCounts[betType] || 0) + 1;
      acc.totals[betType] = acc.userCounts[betType] * matchAmount;
      return acc;
    }, {
      totals: { home: 0, draw: 0, away: 0 },
      userCounts: { home: 0, draw: 0, away: 0 }
    });

    // Calculate total pool and winning amount after house commission
    result.totalPool = Object.values(result.totals).reduce((sum, amount) => sum + amount, 0);
    result.winningAmount = (result.totalPool * 0.9); // 90% of total pool (after 10% house commission)
    
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

  // Update the filtering logic for active games
  const activeGames = userGames.filter(match => {
    const userBet = match.bets?.find(b => b.userId._id === user?._id);
    const isFull = match.bets.length >= 2;
    
    // Show game if:
    // 1. Game is not full (less than 2 bets), or
    // 2. Game is full but user has a bet in it
    return !isFull || userBet;
  });

  // Update the filtering logic for user's bets
  const userBets = userGames.filter(match => {
    const userBet = match.bets?.find(b => b.userId._id === user?._id);
    return userBet;
  });

  const handleCreateGame = async (matchId) => {
    if (!user?._id) {
      alert('Please login to create a game');
      return;
    }

    const stakeAmount = prompt('Enter stake amount (ETB):', '10');
    if (!stakeAmount || isNaN(stakeAmount) || Number(stakeAmount) <= 0) {
      alert('Please enter a valid stake amount');
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/bets/create-game`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          templateMatchId: matchId,
          userId: user._id,
          stakeAmount: Number(stakeAmount)
        })
      });

      const data = await response.json();
      if (response.ok) {
        alert('Game created successfully!');
        window.location.reload(); // Reload the page
      } else {
        alert(data.error || 'Failed to create game');
      }
    } catch (error) {
      console.error('Error creating game:', error);
      alert('An error occurred while creating the game');
    }
  };

  // Update the tabs array to remove the link property
  const tabs = [
    { id: 'events', label: 'Active Games' },
    { id: 'templates', label: 'Create New Game' },
    { id: 'mybets', label: 'My Bets' },
    { id: 'history', label: 'Match History' }  // Remove the link property
  ];

  // Add this function to check if a game's template still exists
  const checkTemplateExists = async (templateId) => {
    try {
      const response = await fetch(`${apiUrl}/api/matches/template/${templateId}`);
      return response.ok;
    } catch (error) {
      console.error('Error checking template:', error);
      return false;
    }
  };

  return (
    <div className={styles.container}>
      {/* Soccer Field Background */}
      <div className={styles.soccerField}>
        <div className={styles.fieldLines}>
          {/* Center Circle */}
          <div className={styles.centerCircle} />
          
          {/* Top Penalty Box */}
          <div className={`${styles.penaltyBox} top-0 left-1/2 -translate-x-1/2`}>
            <div className={`${styles.goalBox} top-0 left-1/2 -translate-x-1/2`} />
            <div className={`${styles.penaltySpot} bottom-[30%] left-1/2 -translate-x-1/2`} />
          </div>
          
          {/* Bottom Penalty Box */}
          <div className={`${styles.penaltyBox} bottom-0 left-1/2 -translate-x-1/2`}>
            <div className={`${styles.goalBox} bottom-0 left-1/2 -translate-x-1/2`} />
            <div className={`${styles.penaltySpot} top-[30%] left-1/2 -translate-x-1/2`} />
          </div>

          {/* Center Line */}
          <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-white/80 -translate-y-1/2" />
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className={styles.userName}>{user?.username}</div>
              <div className={styles.userBalance}>{user?.balance} ETB</div>
            </div>
          </div>

          <div className={styles.tabContainer}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${styles.tab} ${
                  activeTab === tab.id ? styles.activeTab : styles.inactiveTab
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4">
          {activeTab === 'templates' && (
            <div>
              {templateMatches.map(match => (
                <div key={match._id} className={styles.matchCard}>
                  <div className={styles.matchHeader}>
                    <div className={styles.matchTeamsContainer}>
                      <div className={styles.teamContainer}>
                        {match.homeTeamLogo && (
                          <img 
                            src={match.homeTeamLogo} 
                            alt={match.homeTeam}
                            className={styles.teamLogo}
                            onError={(e) => {
                              e.target.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Question_mark_%28black%29.svg/800px-Question_mark_%28black%29.svg.png';
                            }}
                          />
                        )}
                        <span className={styles.teamName}>{match.homeTeam}</span>
                      </div>
                      <span className={styles.vsText}>vs</span>
                      <div className={styles.teamContainer}>
                        {match.awayTeamLogo && (
                          <img 
                            src={match.awayTeamLogo} 
                            alt={match.awayTeam}
                            className={styles.teamLogo}
                            onError={(e) => {
                              e.target.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Question_mark_%28black%29.svg/800px-Question_mark_%28black%29.svg.png';
                            }}
                          />
                        )}
                        <span className={styles.teamName}>{match.awayTeam}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mb-4 text-gray-400 text-sm">
                    {new Date(match.matchDate).toLocaleString()}
                  </div>
                  <button
                    onClick={() => handleCreateGame(match._id)}
                    className="w-full bg-[#3b82f6] hover:bg-blue-600 text-white py-3 rounded-lg font-medium"
                  >
                    Create Game
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'events' && (
            <div>
              {activeGames.map(match => {
                const { totals, userCounts } = calculateTotalsAndCounts(match.bets, match.amount);
                const userBet = match.bets?.find(b => b.userId._id === user?._id);
                const takenBetTypes = match.bets.map(b => b.betType);

                return (
                  <div key={match._id} className={styles.matchCard}>
                    <div className={styles.matchHeader}>
                      <div className={styles.matchTeamsContainer}>
                        <div className={styles.teamContainer}>
                          {match.homeTeamLogo && (
                            <img 
                              src={match.homeTeamLogo} 
                              alt={match.homeTeam}
                              className={styles.teamLogo}
                              onError={(e) => {
                                e.target.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Question_mark_%28black%29.svg/800px-Question_mark_%28black%29.svg.png';
                              }}
                            />
                          )}
                          <span className={styles.teamName}>{match.homeTeam}</span>
                        </div>
                        <span className={styles.vsText}>vs</span>
                        <div className={styles.teamContainer}>
                          {match.awayTeamLogo && (
                            <img 
                              src={match.awayTeamLogo} 
                              alt={match.awayTeam}
                              className={styles.teamLogo}
                              onError={(e) => {
                                e.target.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Question_mark_%28black%29.svg/800px-Question_mark_%28black%29.svg.png';
                              }}
                            />
                          )}
                          <span className={styles.teamName}>{match.awayTeam}</span>
                        </div>
                      </div>
                      <div className={`${styles.matchStatus} ${
                        match.status === 'active' ? 'bg-green-600' : 'bg-gray-600'
                      }`}>
                        {match.status}
                      </div>
                    </div>
                    
                    <div className={styles.betAmount}>{match.amount} ETB</div>
                    <div className={styles.betLabel}>Stake Amount</div>

                    <div className="grid grid-cols-3 gap-3 mt-4">
                      {[
                        { type: 'home', label: match.homeTeam },
                        { type: 'draw', label: 'Draw' },
                        { type: 'away', label: match.awayTeam }
                      ].map(({ type, label }) => {
                        const isDisabled = takenBetTypes.includes(type);
                        const isUserBet = userBet?.betType === type;

                        return (
                          <div key={type} className="flex flex-col">
                            <div className={styles.betTypeLabel}>{label}</div>
                            <button
                              onClick={() => !isDisabled && handleBetClick(type, match._id)}
                              disabled={isDisabled && !isUserBet}
                              className={`${styles.betButton} ${
                                isUserBet
                                  ? 'bg-blue-600 text-white'
                                  : isDisabled
                                  ? styles.betButtonDisabled
                                  : 'bg-[#1a1b26] text-gray-400 hover:bg-[#2a2b36]'
                              }`}
                            >
                              <div className="text-lg font-bold mb-1">
                                {totals[type]} ETB
                              </div>
                              <div className="text-xs">
                                {userCounts[type]} bets
                              </div>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              {activeGames.length === 0 && (
                <div className="text-center text-gray-400 mt-4">
                  No active games available
                </div>
              )}
            </div>
          )}

          {activeTab === 'mybets' && (
            <div>
              {userBets.map(match => {
                const userBet = match.bets?.find(b => b.userId._id === user?._id);
                const { totals, userCounts, totalPool, winningAmount } = calculateTotalsAndCounts(match.bets, match.amount);
                const potentialWin = userBet ? winningAmount / match.bets.filter(b => b.betType === userBet.betType).length : 0;
                const isWinner = match.status === 'completed' && userBet?.betType === match.winnerTeam;
                
                return (
                  <div key={match._id} className={styles.matchCard}>
                    <div className={styles.matchHeader}>
                      <div className={styles.matchTeamsContainer}>
                        <div className={styles.teamContainer}>
                          {match.homeTeamLogo && (
                            <img 
                              src={match.homeTeamLogo} 
                              alt={match.homeTeam}
                              className={styles.teamLogo}
                              onError={(e) => {
                                e.target.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Question_mark_%28black%29.svg/800px-Question_mark_%28black%29.svg.png';
                              }}
                            />
                          )}
                          <span className={styles.teamName}>{match.homeTeam}</span>
                        </div>
                        <span className={styles.vsText}>vs</span>
                        <div className={styles.teamContainer}>
                          {match.awayTeamLogo && (
                            <img 
                              src={match.awayTeamLogo} 
                              alt={match.awayTeam}
                              className={styles.teamLogo}
                              onError={(e) => {
                                e.target.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Question_mark_%28black%29.svg/800px-Question_mark_%28black%29.svg.png';
                              }}
                            />
                          )}
                          <span className={styles.teamName}>{match.awayTeam}</span>
                        </div>
                      </div>
                      <div className={`${styles.matchStatus} ${
                        match.status === 'completed' 
                          ? isWinner ? 'bg-green-600' : 'bg-red-600'
                          : match.status === 'active' ? 'bg-green-600' : 'bg-gray-600'
                      }`}>
                        {match.status}
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-400 mb-2">
                      Your bet: {userBet?.betType === 'home' ? match.homeTeam : 
                                userBet?.betType === 'away' ? match.awayTeam : 'Draw'}
                    </div>
                    
                    <div className={styles.betAmount}>{match.amount} ETB</div>
                    <div className={styles.betLabel}>Stake Amount</div>

                    {/* Add match result information */}
                    {match.status === 'completed' && (
                      <div className="mt-2 mb-4">
                        <div className="text-sm text-gray-400">
                          Final Score: {match.scoreHome} - {match.scoreAway}
                        </div>
                        <div className={`text-lg font-bold ${isWinner ? 'text-green-400' : 'text-red-400'}`}>
                          {isWinner ? (
                            <>Won: {potentialWin.toFixed(2)} ETB</>
                          ) : (
                            <>Lost: {match.amount} ETB</>
                          )}
                        </div>
                        <div className="text-sm text-gray-400">
                          Winner: {match.winnerTeam === 'home' ? match.homeTeam :
                                  match.winnerTeam === 'away' ? match.awayTeam : 'Draw'}
                        </div>
                      </div>
                    )}

                    {match.status !== 'completed' && (
                      <div className="mt-2 mb-4">
                        <div className="text-lg font-bold text-green-400">
                          Potential Win: {potentialWin.toFixed(2)} ETB
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-3 mt-4">
                      {[
                        { type: 'home', label: match.homeTeam },
                        { type: 'draw', label: 'Draw' },
                        { type: 'away', label: match.awayTeam }
                      ].map(({ type, label }) => (
                        <div key={type} className="flex flex-col">
                          <div className={styles.betTypeLabel}>{label}</div>
                          <div className={`${styles.betButton} ${
                            userBet?.betType === type ? 'bg-blue-600 text-white' : 'bg-gray-700'
                          }`}>
                            <div className="text-lg font-bold mb-1">
                              {totals[type]} ETB
                            </div>
                            <div className="text-xs">
                              {userCounts[type]} bets
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              {userBets.length === 0 && (
                <div className="text-center text-gray-400 mt-4">
                  You haven't placed any bets yet
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              {completedMatchesLoading ? (
                <div className="text-center text-white p-4">Loading match history...</div>
              ) : (
                <div className="space-y-4">
                  {completedMatches.map(match => (
                    <div key={match._id} className={styles.matchCard}>
                      <div className={styles.matchTeamsContainer}>
                        <div className={styles.teamContainer}>
                          {match.homeTeamLogo && (
                            <img 
                              src={match.homeTeamLogo} 
                              alt={match.homeTeam}
                              className={styles.teamLogo}
                              onError={(e) => {
                                e.target.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Question_mark_%28black%29.svg/800px-Question_mark_%28black%29.svg.png';
                              }}
                            />
                          )}
                          <span className={styles.teamName}>{match.homeTeam}</span>
                        </div>
                        
                        <div className={styles.scoreContainer}>
                          <span className="text-2xl font-bold">{match.scoreHome}</span>
                          <span className={styles.vsText}>-</span>
                          <span className="text-2xl font-bold">{match.scoreAway}</span>
                        </div>

                        <div className={styles.teamContainer}>
                          {match.awayTeamLogo && (
                            <img 
                              src={match.awayTeamLogo} 
                              alt={match.awayTeam}
                              className={styles.teamLogo}
                              onError={(e) => {
                                e.target.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Question_mark_%28black%29.svg/800px-Question_mark_%28black%29.svg.png';
                              }}
                            />
                          )}
                          <span className={styles.teamName}>{match.awayTeam}</span>
                        </div>
                      </div>

                      <div className={styles.resultDetails}>
                        <div className={styles.winnerText}>
                          Winner: {
                            match.winnerTeam === 'home' ? match.homeTeam :
                            match.winnerTeam === 'away' ? match.awayTeam : 'Draw'
                          }
                        </div>
                        <div className={styles.dateText}>
                          {new Date(match.matchDate).toLocaleDateString()} at {new Date(match.matchDate).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  {completedMatches.length === 0 && (
                    <div className="text-center text-gray-400 mt-4">
                      No completed matches found
                    </div>
                  )}
                </div>
              )}
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
    </div>
  );
};

export default SportsBetting;
