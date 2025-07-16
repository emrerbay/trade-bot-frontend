// API URL'i çevre değişkeninden al, yoksa localhost'u kullan
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function fetchSignal() {
  try {
    const response = await fetch(`${API_URL}/api/signal`, { 
      next: { revalidate: 300 }  // 5 dakikada bir yenile
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching signal:', error);
    throw error;
  }
}

export async function fetchNews() {
  try {
    const response = await fetch(`${API_URL}/api/news`, { 
      next: { revalidate: 300 }  // 5 dakikada bir yenile
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching news data:', error);
    throw error;
  }
}

export async function fetchSignalHistory(days = 7) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateISO = startDate.toISOString();

    const response = await fetch(`${API_URL}/api/signal-history?limit=500&start_date=${startDateISO}`, { 
      next: { revalidate: 60 }  // 1 dakikada bir yenile
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching signal history:', error);
    throw error;
  }
}

export async function fetchBacktestSimulation(days, initialInvestment, strategy, confidenceThreshold) {
  const response = await fetch(
    `${API_URL}/api/backtest-simulation?days=${days}&initial_investment=${initialInvestment}&strategy=${strategy}&confidence_threshold=${confidenceThreshold}`
  );
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `API error: ${response.status} - ${errorData.detail}`
    );
  }

  return await response.json();
}

// Mock data for historical signals (Artık kullanılmıyor)
/*
export function fetchHistoricalSignals() {
  // This would be replaced with a real API call in production
  return Promise.resolve([
    { id: 1, timestamp: '2023-07-07T10:00:00Z', decision: 'BUY', price: 157.23, rsi: 32.1, macd: 'bullish' },
    { id: 2, timestamp: '2023-07-07T09:55:00Z', decision: 'WAIT', price: 156.89, rsi: 45.3, macd: 'neutral' },
    { id: 3, timestamp: '2023-07-07T09:50:00Z', decision: 'WAIT', price: 156.78, rsi: 48.7, macd: 'neutral' },
    { id: 4, timestamp: '2023-07-07T09:45:00Z', decision: 'SELL', price: 157.12, rsi: 72.3, macd: 'bearish' },
    { id: 5, timestamp: '2023-07-07T09:40:00Z', decision: 'SELL', price: 157.45, rsi: 75.8, macd: 'bearish' },
    { id: 6, timestamp: '2023-07-07T09:35:00Z', decision: 'WAIT', price: 157.22, rsi: 68.1, macd: 'neutral' },
    { id: 7, timestamp: '2023-07-07T09:30:00Z', decision: 'WAIT', price: 156.98, rsi: 55.4, macd: 'neutral' },
    { id: 8, timestamp: '2023-07-07T09:25:00Z', decision: 'BUY', price: 156.45, rsi: 28.9, macd: 'bullish' },
    { id: 9, timestamp: '2023-07-07T09:20:00Z', decision: 'BUY', price: 156.12, rsi: 25.3, macd: 'bullish' },
    { id: 10, timestamp: '2023-07-07T09:15:00Z', decision: 'WAIT', price: 156.78, rsi: 42.7, macd: 'neutral' },
  ]);
}
*/