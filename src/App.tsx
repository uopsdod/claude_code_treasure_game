import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from './components/ui/button';
import LoginForm from './components/auth/LoginForm';
import SignupForm from './components/auth/SignupForm';
import UserProfile from './components/auth/UserProfile';
import { useAuth } from './contexts/AuthContext';
import { saveGameScore, getUserScores } from './services/api';
import closedChest from './assets/treasure_closed.png';
import treasureChest from './assets/treasure_opened.png';
import skeletonChest from './assets/treasure_opened_skeleton.png';
import keyIcon from './assets/key.png';
import chestOpenSound from './audios/chest_open.mp3';
import evilLaughSound from './audios/chest_open_with_evil_laugh.mp3';

interface Box {
  id: number;
  isOpen: boolean;
  hasTreasure: boolean;
}

type GameMode = 'guest' | 'auth' | 'profile';
type AuthMode = 'signin' | 'signup';

export default function App() {
  const { user, token, login, signup, logout, isAuthenticated } = useAuth();
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [score, setScore] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);
  const [showKeyCursor, setShowKeyCursor] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [gameMode, setGameMode] = useState<GameMode>('guest');
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [userStats, setUserStats] = useState(null);
  const [recentScores, setRecentScores] = useState([]);

  const initializeGame = () => {
    // Randomly assign treasure to one box
    const treasureBoxIndex = Math.floor(Math.random() * 3);
    const newBoxes: Box[] = Array.from({ length: 3 }, (_, index) => ({
      id: index,
      isOpen: false,
      hasTreasure: index === treasureBoxIndex,
    }));
    
    setBoxes(newBoxes);
    setScore(0);
    setGameEnded(false);
  };

  // Initialize game automatically when component mounts
  useEffect(() => {
    initializeGame();
  }, []);

  // Track mouse position for custom cursor - Input: mouse events, Output: void
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const openBox = (boxId: number) => {
    if (gameEnded) return;
    
    setBoxes(prevBoxes => {
      const updatedBoxes = prevBoxes.map(box => {
        if (box.id === boxId && !box.isOpen) {
          const newScore = box.hasTreasure ? score + 150 : score - 50;
          setScore(newScore);
          
          // Play sound effect when chest is opened
          playChestOpenSoundEffect(box.hasTreasure);
          
          return { ...box, isOpen: true };
        }
        return box;
      });
      
      // Check if treasure is found or all boxes are opened
      const treasureFound = updatedBoxes.some(box => box.isOpen && box.hasTreasure);
      const allOpened = updatedBoxes.every(box => box.isOpen);
      if (treasureFound || allOpened) {
        setGameEnded(true);
      }
      
      return updatedBoxes;
    });
  };

  // Plays appropriate sound effect based on treasure box content - Input: hasTreasure (boolean), Output: void
  const playChestOpenSoundEffect = (hasTreasure: boolean) => {
    const audioFile = hasTreasure ? chestOpenSound : evilLaughSound;
    const audio = new Audio(audioFile);
    audio.play().catch(console.error);
  };

  // Determines game result based on final score - Input: finalScore (number), Output: string (win/tie/loss)
  const getGameResult = (finalScore: number) => {
    if (finalScore > 0) return 'Win';
    if (finalScore === 0) return 'Tie';
    return 'Loss';
  };

  // Load user stats when authenticated - Input: none, Output: void
  const loadUserStats = async () => {
    if (isAuthenticated && token) {
      try {
        const data = await getUserScores(token);
        setUserStats(data.stats);
        setRecentScores(data.scores);
      } catch (error) {
        console.error('Failed to load user stats:', error);
      }
    }
  };

  // Save game score for authenticated users - Input: none, Output: void
  const saveCurrentGameScore = async () => {
    if (isAuthenticated && token && gameEnded) {
      try {
        const boxesOpened = boxes.filter(box => box.isOpen).length;
        const treasureFound = boxes.some(box => box.isOpen && box.hasTreasure);
        
        await saveGameScore({
          score,
          result: getGameResult(score),
          boxes_opened: boxesOpened,
          treasure_found: treasureFound,
        }, token);
        
        // Refresh stats after saving
        await loadUserStats();
      } catch (error) {
        console.error('Failed to save game score:', error);
      }
    }
  };

  // Handle user login - Input: username, password, Output: void
  const handleLogin = async (username: string, password: string) => {
    setIsAuthLoading(true);
    try {
      await login(username, password);
      setGameMode('guest'); // Return to game after login
      await loadUserStats();
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Handle user signup - Input: username, email, password, Output: void
  const handleSignup = async (username: string, email: string, password: string) => {
    setIsAuthLoading(true);
    try {
      await signup(username, email, password);
      setGameMode('guest'); // Return to game after signup
      await loadUserStats();
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Handle user logout - Input: none, Output: void
  const handleLogout = () => {
    logout();
    setGameMode('guest');
    setUserStats(null);
    setRecentScores([]);
  };

  const resetGame = () => {
    initializeGame();
  };

  // Load user stats on authentication change
  useEffect(() => {
    if (isAuthenticated) {
      loadUserStats();
    }
  }, [isAuthenticated]);

  // Save score when game ends for authenticated users
  useEffect(() => {
    if (gameEnded && isAuthenticated) {
      saveCurrentGameScore();
    }
  }, [gameEnded, isAuthenticated]);

  // Profile mode view
  if (gameMode === 'profile' && isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 flex flex-col items-center justify-center p-8">
        <UserProfile
          user={user}
          stats={userStats}
          recentScores={recentScores}
          onLogout={handleLogout}
          onBackToGame={() => setGameMode('guest')}
        />
      </div>
    );
  }

  // Authentication mode view
  if (gameMode === 'auth') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 flex flex-col items-center justify-center p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl mb-4 text-amber-900">🏴‍☠️ Treasure Hunt Game 🏴‍☠️</h1>
          <p className="text-amber-800 mb-4">
            Join the adventure! Sign in or create an account to track your progress.
          </p>
        </div>

        {authMode === 'signin' ? (
          <LoginForm
            onLogin={handleLogin}
            onToggleForm={() => setAuthMode('signup')}
            isLoading={isAuthLoading}
          />
        ) : (
          <SignupForm
            onSignup={handleSignup}
            onToggleForm={() => setAuthMode('signin')}
            isLoading={isAuthLoading}
          />
        )}

        <div className="mt-6">
          <Button
            onClick={() => setGameMode('guest')}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            Continue as Guest
          </Button>
        </div>
      </div>
    );
  }

  // Main game view
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 flex flex-col items-center justify-center p-8">
      {/* Header with auth controls */}
      <div className="absolute top-4 right-4 flex space-x-3">
        {isAuthenticated ? (
          <>
            <Button
              onClick={() => setGameMode('profile')}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1"
            >
              Profile ({user?.username})
            </Button>
            <Button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-black text-sm px-3 py-1"
            >
              Logout
            </Button>
          </>
        ) : (
          <Button
            onClick={() => setGameMode('auth')}
            className="bg-amber-600 hover:bg-amber-700 text-white text-sm px-3 py-1"
          >
            Sign In / Sign Up
          </Button>
        )}
        {/* Debug info */}
        <div className="text-xs text-gray-500 bg-white/50 px-2 py-1 rounded">
          Auth: {isAuthenticated ? 'Yes' : 'No'} | User: {user?.username || 'None'}
        </div>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-4xl mb-4 text-amber-900">🏴‍☠️ Treasure Hunt Game 🏴‍☠️</h1>
        <p className="text-amber-800 mb-4">
          Click on the treasure chests to discover what's inside!
        </p>
        <p className="text-amber-700 text-sm">
          💰 Treasure: +$150 | 💀 Skeleton: -$50
        </p>
        {!isAuthenticated && (
          <p className="text-amber-600 text-xs mt-2">
            Playing as guest - scores won't be saved
          </p>
        )}
      </div>

      <div className="mb-8">
        <div className="text-2xl text-center p-4 bg-amber-200/80 backdrop-blur-sm rounded-lg shadow-lg border-2 border-amber-400">
          <span className="text-amber-900">Current Score: </span>
          <span className={`${score >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${score}
          </span>
          {gameEnded && (
            <div className="mt-2 text-xl font-bold">
              <span className="text-amber-900">Result: </span>
              <span className={`${
                getGameResult(score) === 'Win' ? 'text-green-600' : 
                getGameResult(score) === 'Tie' ? 'text-yellow-600' : 
                'text-red-600'
              }`}>
                {getGameResult(score)}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {boxes.map((box) => (
              <motion.div
                key={box.id}
                className="flex flex-col items-center cursor-pointer"
                style={{
                  cursor: box.isOpen ? 'default' : 'none'
                }}
                whileHover={{ scale: box.isOpen ? 1 : 1.05 }}
                whileTap={{ scale: box.isOpen ? 1 : 0.95 }}
                onMouseEnter={() => !box.isOpen && setShowKeyCursor(true)}
                onMouseLeave={() => setShowKeyCursor(false)}
                onClick={() => openBox(box.id)}
              >
                <motion.div
                  initial={{ rotateY: 0 }}
                  animate={{ 
                    rotateY: box.isOpen ? 180 : 0,
                    scale: box.isOpen ? 1.1 : 1
                  }}
                  transition={{ 
                    duration: 0.6,
                    ease: "easeInOut"
                  }}
                  className="relative"
                >
                  <img
                    src={box.isOpen 
                      ? (box.hasTreasure ? treasureChest : skeletonChest)
                      : closedChest
                    }
                    alt={box.isOpen 
                      ? (box.hasTreasure ? "Treasure!" : "Skeleton!")
                      : "Treasure Chest"
                    }
                    className="w-48 h-48 object-contain drop-shadow-lg"
                  />
                  
                  {box.isOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                    >
                      {box.hasTreasure ? (
                        <div className="text-2xl animate-bounce">✨💰✨</div>
                      ) : (
                        <div className="text-2xl animate-pulse">💀👻💀</div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
                
                <div className="mt-4 text-center">
                  {box.isOpen ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4, duration: 0.3 }}
                      className={`text-lg p-2 rounded-lg ${
                        box.hasTreasure 
                          ? 'bg-green-100 text-green-800 border border-green-300' 
                          : 'bg-red-100 text-red-800 border border-red-300'
                      }`}
                    >
                      {box.hasTreasure ? '+$150' : '-$50'}
                    </motion.div>
                  ) : (
                    <div className="text-amber-700 p-2">
                      Click to open!
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
      </div>

      {gameEnded && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="mb-4 p-6 bg-amber-200/80 backdrop-blur-sm rounded-xl shadow-lg border-2 border-amber-400">
                <h2 className="text-2xl mb-2 text-amber-900">Game Over!</h2>
                <p className="text-lg text-amber-800">
                  Final Score: <span className={`${score >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${score}
                  </span>
                </p>
                <p className="text-sm text-amber-600 mt-2">
                  {boxes.some(box => box.isOpen && box.hasTreasure) 
                    ? 'Treasure found! Well done, treasure hunter! 🎉' 
                    : 'No treasure found this time! Better luck next time! 💀'}
                </p>
              </div>
              
              <div className="flex flex-col space-y-3">
                <Button 
                  onClick={resetGame}
                  className="text-lg px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white"
                >
                  Play Again
                </Button>
                {isAuthenticated && (
                  <p className="text-amber-600 text-sm">
                    ✓ Score saved to your profile
                  </p>
                )}
              </div>
            </motion.div>
          )}

      {/* Custom key cursor */}
      {showKeyCursor && (
        <div
          className="fixed pointer-events-none z-50"
          style={{
            left: mousePosition.x - 12,
            top: mousePosition.y - 12,
          }}
        >
          <img src={keyIcon} alt="Key cursor" className="w-6 h-6" />
        </div>
      )}
    </div>
  );
}
