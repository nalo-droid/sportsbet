import React from 'react';
// import Button from './Button';

const AllBets = ({ bets, stake, acceptBet }) => {
  return (
    <div className="lg:w-3/5 bg-gray-800 rounded-lg shadow-lg border border-gray-700 flex flex-col">
      <h3 className="text-2xl font-bold p-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 border-b border-gray-700">Created Bets</h3>
      <div className="overflow-y-auto flex-grow p-6 custom-scrollbar space-y-6">
        {bets && bets.length > 0 ? (
          bets.map(bet => {
            const takenBetTypes = bet.bets ? bet.bets.map(userBet => userBet.betType) : [];
            return (
              <div key={bet._id} className="bg-gray-700 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-600">
                <div className="text-xl font-medium mb-2 text-blue-300">
                  {bet.homeTeam} vs {bet.awayTeam}
                </div>
                <div className="text-lg mb-4 text-gray-400">
                  <span className="font-semibold">Date:</span> {new Date(bet.createdAt).toLocaleDateString()} {new Date(bet.createdAt).toLocaleTimeString()}
                </div>
                {bet.bets && bet.bets.map(userBet => (
                  <div key={userBet._id} className="mb-4">
                    <div className="text-lg mb-2 text-gray-400">
                      <span className="font-semibold">@{userBet.userId.username} bet on {userBet.betType} with {userBet.amount} ETB </span>
                    </div>
                  </div>
                ))}
                <div className="grid grid-cols-3 gap-4">
                  {!takenBetTypes.includes('home') && (
                    <Button onClick={() => acceptBet(bet.matchId, 'home', stake, bet.homeTeam, bet.awayTeam)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300 lg:py-1 lg:px-2 text-sm">Home</Button>
                  )}
                  {!takenBetTypes.includes('draw') && (
                    <Button onClick={() => acceptBet(bet.matchId, 'draw', stake, bet.homeTeam, bet.awayTeam)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300 lg:py-1 lg:px-2 text-sm">Draw</Button>
                  )}
                  {!takenBetTypes.includes('away') && (
                    <Button onClick={() => acceptBet(bet.matchId, 'away', stake, bet.homeTeam, bet.awayTeam)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300 lg:py-1 lg:px-2 text-sm">Away</Button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-gray-400">No bets available.</p>
        )}
      </div>
    </div>
  );
};

export default AllBets;