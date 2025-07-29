// API URL'i çevre değişkeninden al, yoksa varsayılan URL'i kullan
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Backend bağlantısını kontrol et
let isBackendAvailable = false;

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

// Backend erişilebilirliğini kontrol et
async function checkBackendAvailability() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    const response = await fetch(`${API_URL}/api/signal`, { 
      method: 'HEAD',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    isBackendAvailable = response.ok;
    console.log('Backend available:', isBackendAvailable);
    return isBackendAvailable;
  } catch (error) {
    console.warn('Backend not available, using default data');
    isBackendAvailable = false;
    return false;
  }
}

// İlk yükleme sırasında backend'i kontrol et
if (typeof window !== 'undefined') {
  checkBackendAvailability();
}

export async function fetchSignal() {
  try {
    // Backend erişilebilir değilse varsayılan veriyi döndür
    if (!isBackendAvailable) {
      await checkBackendAvailability();
      if (!isBackendAvailable) {
        console.warn('Backend not available, using default signal data');
        return DEFAULT_SIGNAL;
      }
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
    // Backend erişilebilir değilse varsayılan veriyi döndür
    if (!isBackendAvailable) {
      await checkBackendAvailability();
      if (!isBackendAvailable) {
        console.warn('Backend not available, using default news data');
        return DEFAULT_NEWS;
      }
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
    // Backend erişilebilir değilse varsayılan veriyi döndür
    if (!isBackendAvailable) {
      await checkBackendAvailability();
      if (!isBackendAvailable) {
        console.warn('Backend not available, using mock signal history');
        // Basit bir geçmiş sinyal verisi oluştur
        return generateMockSignalHistory(days);
      }
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
    return generateMockSignalHistory(days); // Hata durumunda mock veri döndür
  }
}

export async function fetchBacktestSimulation(days, initialInvestment, strategy, confidenceThreshold) {
  try {
    // Backend erişilebilir değilse varsayılan veriyi döndür
    if (!isBackendAvailable) {
      await checkBackendAvailability();
      if (!isBackendAvailable) {
        console.warn('Backend not available, using mock backtest data');
        // Basit bir simülasyon verisi oluştur
        const mockData = generateMockBacktestData(days, initialInvestment, strategy);
        return mockData;
      }
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

// Mock sinyal geçmişi verisi oluştur
function generateMockSignalHistory(days) {
  const signals = [];
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  let currentPrice = 700;
  
  // Her gün için veri oluştur
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    // Rastgele fiyat değişimi (-3% ile +3% arası)
    const change = (Math.random() * 6 - 3) / 100;
    currentPrice = currentPrice * (1 + change);
    
    // Günde 1-3 sinyal oluştur
    const signalCount = Math.floor(Math.random() * 3) + 1;
    
    for (let j = 0; j < signalCount; j++) {
      // Saati rastgele ayarla
      const hour = Math.floor(Math.random() * 8) + 9; // 9-17 arası
      const minute = Math.floor(Math.random() * 60);
      date.setHours(hour, minute, 0, 0);
      
      // Rastgele karar
      const decisions = ["BUY", "SELL", "WAIT"];
      const decision = decisions[Math.floor(Math.random() * decisions.length)];
      
      signals.push({
        timestamp: new Date(date).toISOString(),
        decision: decision,
        price: parseFloat(currentPrice.toFixed(2)),
        confidence: parseFloat((Math.random() * 0.4 + 0.6).toFixed(2)), // 0.6 ile 1.0 arası
        latest_indicators: {
          rsi: parseFloat((Math.random() * 100).toFixed(2)),
          macd: parseFloat((Math.random() * 2 - 1).toFixed(2)),
          macd_signal: parseFloat((Math.random() * 2 - 1).toFixed(2)),
          sma_200: parseFloat((currentPrice * (1 + (Math.random() * 0.1 - 0.05))).toFixed(2))
        }
      });
    }
  }
  
  // Tarihe göre sırala
  signals.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  
  return signals;
}