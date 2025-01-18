import { Link } from 'react-router-dom';

const Games = () => {
  const games = [
    {
      id: 'sports-betting',
      name: 'Sports Betting',
      description: 'Bet on sports outcomes against other players',
      minBet: '10 ETB',
      image: '⚽'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Available Games</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => (
          <Link
            key={game.id}
            to={`/games/${game.id}`}
            className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors"
          >
            <div className="text-4xl mb-4">{game.image}</div>
            <h2 className="text-2xl font-bold mb-2">{game.name}</h2>
            <p className="text-gray-400 mb-4">{game.description}</p>
            <div className="text-sm text-gray-500">
              Minimum bet: {game.minBet}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Games; 