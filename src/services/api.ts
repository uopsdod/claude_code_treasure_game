const API_BASE_URL = 'http://localhost:3001/api';

// Save game score to backend for authenticated users - Input: score data and token, Output: void
export const saveGameScore = async (
  scoreData: {
    score: number;
    result: string;
    boxes_opened: number;
    treasure_found: boolean;
  },
  token: string
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/scores`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(scoreData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to save score');
  }
};

// Get user's score history and statistics - Input: token, Output: scores and stats
export const getUserScores = async (token: string) => {
  const response = await fetch(`${API_BASE_URL}/scores/user`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch scores');
  }

  return response.json();
};