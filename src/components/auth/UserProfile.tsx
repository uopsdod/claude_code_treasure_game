import { motion } from 'motion/react';
import { Button } from '../ui/button';

interface GameScore {
  score: number;
  result: string;
  boxes_opened: number;
  treasure_found: boolean;
  played_at: string;
}

interface UserStats {
  totalGames: number;
  wins: number;
  losses: number;
  ties: number;
  highestScore: number;
  averageScore: number;
}

interface UserProfileProps {
  user: {
    id: number;
    username: string;
    email: string;
  };
  stats: UserStats | null;
  recentScores: GameScore[];
  onLogout: () => void;
  onBackToGame: () => void;
}

// User profile component showing stats and recent games - Input: user data, stats, scores, callbacks, Output: void
export default function UserProfile({ user, stats, recentScores, onLogout, onBackToGame }: UserProfileProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-amber-50/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-amber-300 p-6 max-w-4xl w-full"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-amber-900">Welcome, {user.username}!</h2>
          <p className="text-amber-700">{user.email}</p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={onBackToGame}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Back to Game
          </Button>
          <Button
            onClick={onLogout}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Logout
          </Button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-amber-100 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-amber-900">{stats.totalGames}</div>
            <div className="text-amber-700 text-sm">Total Games</div>
          </div>
          <div className="bg-green-100 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-700">{stats.wins}</div>
            <div className="text-green-600 text-sm">Wins</div>
          </div>
          <div className="bg-red-100 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-700">{stats.losses}</div>
            <div className="text-red-600 text-sm">Losses</div>
          </div>
          <div className="bg-yellow-100 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-yellow-700">{stats.ties}</div>
            <div className="text-yellow-600 text-sm">Ties</div>
          </div>
          <div className="bg-blue-100 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-700">${stats.highestScore}</div>
            <div className="text-blue-600 text-sm">Best Score</div>
          </div>
          <div className="bg-purple-100 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-700">${stats.averageScore}</div>
            <div className="text-purple-600 text-sm">Average</div>
          </div>
        </div>
      )}

      {recentScores.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-amber-900 mb-4">Recent Games</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {recentScores.map((score, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  score.result === 'Win'
                    ? 'bg-green-50 border-green-200'
                    : score.result === 'Loss'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-yellow-50 border-yellow-200'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <span className={`font-semibold ${
                      score.result === 'Win'
                        ? 'text-green-700'
                        : score.result === 'Loss'
                        ? 'text-red-700'
                        : 'text-yellow-700'
                    }`}>
                      {score.result}
                    </span>
                    <span className="text-amber-900 font-medium">${score.score}</span>
                    <span className="text-amber-700 text-sm">
                      {score.boxes_opened} boxes • {score.treasure_found ? '💰' : '💀'}
                    </span>
                  </div>
                  <span className="text-amber-600 text-sm">
                    {formatDate(score.played_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {recentScores.length === 0 && (
        <div className="text-center py-8">
          <div className="text-amber-600 text-lg mb-2">No games played yet!</div>
          <div className="text-amber-500">Start playing to see your statistics here.</div>
        </div>
      )}
    </motion.div>
  );
}