// API URL'i çevre değişkeninden al, yoksa bağıl yolu kullan
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Hata durumunda kullanılacak varsayılan veri
const DEFAULT_SIGNAL = {
  decision: "WAIT",
  price: 700.50,
  timestamp: new Date().toISOString(),
  confidence: 0.65,
  latest_indicators: {
    rsi: 45.5,
    macd: 0.75,
    macd_signal: 0.25,
    sma_200: 680.20
  }
};

const DEFAULT_NEWS = {
  articles: [
    { title: "NVDA yeni çip mimarisini duyurdu", published: new Date().toISOString() },
    { title: "Yapay zeka pazarında NVDA liderliğini sürdürüyor", published: new Date(Date.now() - 86400000).toISOString() },
    { title: "NVDA hisseleri rekor seviyeye ulaştı", published: new Date(Date.now() - 172800000).toISOString() }
  ],
  sentiment: {
    bullish: 3,
    bearish: 1,
    neutral: 2
  },
  timestamp: new Date().toISOString()
};

export async function fetchSignal() {
  try {
    // API URL yoksa veya boşsa varsayılan veriyi döndür
    if (!API_URL) {
      console.warn('API URL not set, using default signal data');
      return DEFAULT_SIGNAL;
    }

    const response = await fetch(`${API_URL}/api/signal`, { 
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching signal:', error);
    return DEFAULT_SIGNAL; // Hata durumunda varsayılan veriyi döndür
  }
}

export async function fetchNews() {
  try {
    // API URL yoksa veya boşsa varsayılan veriyi döndür
    if (!API_URL) {
      console.warn('API URL not set, using default news data');
      return DEFAULT_NEWS;
    }

    const response = await fetch(`${API_URL}/api/news`, { 
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching news data:', error);
    return DEFAULT_NEWS; // Hata durumunda varsayılan veriyi döndür
  }
}

export async function fetchSignalHistory(days = 7) {
  try {
    // API URL yoksa veya boşsa boş dizi döndür
    if (!API_URL) {
      console.warn('API URL not set, using empty signal history');
      return [];
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateISO = startDate.toISOString();

    const response = await fetch(`${API_URL}/api/signal-history?limit=500&start_date=${startDateISO}`, { 
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching signal history:', error);
    return []; // Hata durumunda boş dizi döndür
  }
}

export async function fetchBacktestSimulation(days, initialInvestment, strategy, confidenceThreshold) {
  try {
    // API URL yoksa veya boşsa varsayılan veriyi döndür
    if (!API_URL) {
      console.warn('API URL not set, using mock backtest data');
      // Basit bir simülasyon verisi oluştur
      const mockData = generateMockBacktestData(days, initialInvestment, strategy);
      return mockData;
    }

    const response = await fetch(
      `${API_URL}/api/backtest-simulation?days=${days}&initial_investment=${initialInvestment}&strategy=${strategy}&confidence_threshold=${confidenceThreshold}`,
      { cache: 'no-store' }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API error: ${response.status} - ${errorData.detail}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching backtest simulation:', error);
    // Hata durumunda mock veri döndür
    return generateMockBacktestData(days, initialInvestment, strategy);
  }
}

// Mock backtest verisi oluştur
function generateMockBacktestData(days, initialInvestment, strategy) {
  const priceData = [];
  const trades = [];
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  let currentPrice = 700;
  let currentValue = initialInvestment;
  
  // Her gün için veri oluştur
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    // Rastgele fiyat değişimi (-3% ile +3% arası)
    const change = (Math.random() * 6 - 3) / 100;
    currentPrice = currentPrice * (1 + change);
    
    // Değeri güncelle
    if (strategy === 'buyAndHold') {
      currentValue = initialInvestment * (currentPrice / 700);
    } else {
      // Signals stratejisi için daha değişken sonuçlar
      currentValue = currentValue * (1 + change * (Math.random() > 0.5 ? 1.5 : 0.8));
    }
    
    priceData.push({
      time: date.toISOString(),
      value: currentValue
    });
    
    // %15 ihtimalle bir sinyal oluştur
    if (Math.random() < 0.15) {
      const isBuy = Math.random() > 0.5;
      trades.push({
        time: date.toISOString(),
        type: isBuy ? 'BUY' : 'SELL',
        price: currentPrice,
        confidence: Math.random() * 0.5 + 0.5 // 0.5 ile 1.0 arası
      });
    }
  }
  
  // Sonuç değerlerini hesapla
  const finalValue = currentValue;
  const profitLossPct = ((finalValue - initialInvestment) / initialInvestment) * 100;
  
  return {
    price_data: priceData,
    trades: trades,
    final_value: finalValue,
    profit_loss_pct: profitLossPct
  };
}