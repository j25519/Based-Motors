import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import { FaBalanceScale } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';
import CarList from './components/CarList';
import Checkout from './components/Checkout';
import CompareModal from './components/CompareModal';
import './index.css';

function App() {
  const [usdRate, setUsdRate] = useState(0);
  const [gbpRate, setGbpRate] = useState(0);
  const [eurRate, setEurRate] = useState(0);
  const [error, setError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('Default');
  const [currency, setCurrency] = useState('USD');
  const [checkout, setCheckout] = useState(null);
  const [compareCars, setCompareCars] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    console.log('Dark mode state:', isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  const fetchPrices = async (forceRefresh = false) => {
    console.log('fetchPrices called at', new Date().toISOString(), 'forceRefresh:', forceRefresh);
    const cached = JSON.parse(localStorage.getItem('btcRates'));
    if (!forceRefresh && cached && Date.now() - cached.timestamp < 4 * 60 * 1000) {
      console.log('Using cached rates:', cached);
      setUsdRate(cached.usd);
      setGbpRate(cached.gbp);
      setEurRate(cached.eur);
      setLastUpdated(new Date().toLocaleTimeString('en-GB', { timeZone: 'Europe/London' }));
      toast.info('Prices updated from cache', { position: 'top-center', autoClose: 2000 });
      return;
    }

    let usdPrice, gbpPrice, eurPrice;

    // Try CoinGecko first
    try {
      const res = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,gbp,eur'
      );
      const data = await res.json();
      console.log('CoinGecko Response:', data);

      usdPrice = parseFloat(data.bitcoin.usd);
      gbpPrice = parseFloat(data.bitcoin.gbp);
      eurPrice = parseFloat(data.bitcoin.eur);

      // Validate GBP price
      if (!gbpPrice || gbpPrice <= 0 || Math.abs(gbpPrice - usdPrice * 0.75) > usdPrice * 0.15) {
        console.warn('Invalid GBP rate from CoinGecko:', gbpPrice);
        // Fetch GBP from Kraken
        try {
          const krakenRes = await fetch('https://api.kraken.com/0/public/Ticker?pair=XXBTZGBP');
          const krakenData = await krakenRes.json();
          console.log('Kraken GBP Response:', krakenData);
          if (krakenData.error.length === 0) {
            gbpPrice = parseFloat(krakenData.result.XXBTZGBP.c[0]);
            console.log('Using Kraken GBP price:', gbpPrice);
          } else {
            console.warn('Kraken GBP fetch failed, using fallback:', krakenData.error);
            gbpPrice = 78124.09;
          }
        } catch (krakenErr) {
          console.error('Kraken GBP fetch error:', krakenErr);
          gbpPrice = 78124.09;
        }
      }
    } catch (err) {
      console.error('CoinGecko fetch error:', err);
      // Fall back to Kraken for all prices
      try {
        const krakenRes = await fetch(
          'https://api.kraken.com/0/public/Ticker?pair=XXBTZUSD,XXBTZGBP,XXBTZEUR'
        );
        const krakenData = await krakenRes.json();
        console.log('Kraken Response:', krakenData);
        if (krakenData.error.length === 0) {
          usdPrice = parseFloat(krakenData.result.XXBTZUSD.c[0]);
          gbpPrice = parseFloat(krakenData.result.XXBTZGBP.c[0]);
          eurPrice = parseFloat(krakenData.result.XXBTZEUR.c[0]);
        } else {
          throw new Error('Kraken API error: ' + krakenData.error.join(', '));
        }
      } catch (krakenErr) {
        console.error('Kraken fetch error:', krakenErr);
        setError('Failed to fetch prices from both APIs. Using fallback rates.');
        usdPrice = 103475.55;
        gbpPrice = 78124.09;
        eurPrice = 97530.4;
      }
    }

    setUsdRate(usdPrice);
    setGbpRate(gbpPrice);
    setEurRate(eurPrice);
    if (!error) setError(null);
    const timestamp = Date.now();
    setLastUpdated(new Date(timestamp).toLocaleTimeString('en-GB', { timeZone: 'Europe/London' }));
    localStorage.setItem('btcRates', JSON.stringify({ usd: usdPrice, gbp: gbpPrice, eur: eurPrice, timestamp }));
    console.log('Prices updated:', { usdPrice, gbpPrice, eurPrice, timestamp });
    toast.info('Bitcoin prices updated!', { position: 'top-center', autoClose: 2000 });
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(() => fetchPrices(), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCheckout = (car, paymentMethod) => {
    setCheckout({ car, paymentMethod });
  };

  const closeCheckout = () => {
    setCheckout(null);
  };

  const handleResetCompare = () => {
    setCompareCars([]);
    setShowCompareModal(false);
  };

  const cars = [
  {
    id: 1,
    name: 'Tesla Model 3',
    brand: 'Tesla',
    btcPrice: 0.515,
    image: '/carpics/tesla-model-3-g.png',
    specs: {
      battery: '75 kWh',
      range: '330 mi',
      zeroToSixty: '3.1 s',
      topSpeed: '162 mph',
    },
    tags: ['New Model 3', 'saloon'],
  },
  {
    id: 2,
    name: 'Tesla Model Y',
    brand: 'Tesla',
    btcPrice: 0.58,
    image: '/carpics/tsla-model-y.png',
    specs: {
      battery: '81 kWh',
      range: '326 mi',
      zeroToSixty: '3.5 s',
      topSpeed: '155 mph',
    },
    tags: ['New Model Y', 'SUV'],
  },
  {
    id: 3,
    name: 'Tesla Cybertruck',
    brand: 'Tesla',
    btcPrice: 1.2,
    image: '/carpics/cybertruck-side.png',
    specs: {
      battery: '120 kWh',
      range: '340 mi',
      zeroToSixty: '2.9 s',
      topSpeed: '130 mph',
    },
    tags: ['Cyberbeast', 'pickup truck', 'luxury'],
  },
  {
    id: 4,
    name: 'BYD Dolphin',
    brand: 'BYD',
    btcPrice: 0.33,
    image: '/carpics/byd-dolpin.png',
    specs: {
      battery: '44.9 kWh',
      range: '265 mi',
      zeroToSixty: '7.0 s',
      topSpeed: '99 mph',
    },
    tags: ['hatchback', 'build your dreams', 'cheap', 'budget'],
  },
  {
    id: 5,
    name: 'BYD Seal',
    brand: 'BYD',
    btcPrice: 0.59,
    image: '/carpics/byd-seal.png',
    specs: {
      battery: '82.5 kWh',
      range: '323 mi',
      zeroToSixty: '3.8 s',
      topSpeed: '112 mph',
    },
    tags: ['saloon', 'build your dreams'],
  },
  {
    id: 6,
    name: 'VW ID.Buzz',
    brand: 'VW',
    btcPrice: 0.77,
    image: '/carpics/vw-buzz.png',
    specs: {
      battery: '77 kWh',
      range: '258 mi',
      zeroToSixty: '6.4 s',
      topSpeed: '90 mph',
    },
    tags: ['Volkswagen', 'VW', 'Buzz', 'Van'],
  },
  {
    id: 7,
    name: 'VW ID.3',
    brand: 'VW',
    btcPrice: 0.4,
    image: '/carpics/vw-id3.png',
    specs: {
      battery: '77 kWh',
      range: '260 mi',
      zeroToSixty: '7.9 s',
      topSpeed: '99 mph',
    },
    tags: ['Volkswagen', 'hatchback', 'ID3'],
  },
  {
    id: 8,
    name: 'VW ID.4',
    brand: 'VW',
    btcPrice: 0.515,
    image: '/carpics/vw-id4-gtx.png',
    specs: {
      battery: '77 kWh',
      range: '275 mi',
      zeroToSixty: '5.7 s',
      topSpeed: '99 mph',
    },
    tags: ['Volkswagen', 'VW', 'ID4', 'SUV'],
  },
  {
    id: 9,
    name: 'Rolls-Royce Spectre',
    brand: 'Rolls-Royce',
    btcPrice: 4.2,
    image: '/carpics/RR-Spectre-White.png',
    specs: {
      battery: '102 kWh',
      range: '266 mi',
      zeroToSixty: '4.4 s',
      topSpeed: '155 mph',
    },
    tags: ['coupe', 'luxury'],
  },
  {
    id: 10,
    name: 'Mercedes G-Wagon',
    brand: 'Mercedes',
    btcPrice: 1.55,
    image: '/carpics/gwagon.png',
    specs: {
      battery: '116 kWh',
      range: '240 mi',
      zeroToSixty: '4.4 s',
      topSpeed: '112 mph',
    },
    tags: ['Benz', 'SUV', 'luxury'],
  },
];

  // Sort cars by battery, range, top speed
  const parseBattery = (battery) => {
    const match = battery.match(/(\d+\.?\d*)\s*kWh/);
    return match ? parseFloat(match[1]) : 0;
  };

  const parseRange = (range) => {
    const match = range.match(/(\d+)\s*mi/);
    return match ? parseInt(match[1], 10) : 0;
  };

  const parseTopSpeed = (topSpeed) => {
    const match = topSpeed.match(/(\d+)\s*mph/);
    return match ? parseInt(match[1], 10) : 0;
  };

  // Filter and sort cars
  const filteredCars = cars
    .filter((car) => {
      const query = searchQuery.toLowerCase();
      const nameMatch = car.name.toLowerCase().includes(query);
      const tagsMatch = car.tags?.some((tag) => tag.toLowerCase().includes(query));
      return nameMatch || tagsMatch;
    })
    .filter((car) => brandFilter === 'All' || car.brand === brandFilter)
    .sort((a, b) => {
      switch (sortOrder) {
        case 'Low to High':
          return a.btcPrice - b.btcPrice;
        case 'High to Low':
          return b.btcPrice - a.btcPrice;
        case 'Battery High to Low':
          return parseBattery(b.specs.battery) - parseBattery(a.specs.battery);
        case 'Battery Low to High':
          return parseBattery(a.specs.battery) - parseBattery(b.specs.battery);
        case 'Range High to Low':
          return parseRange(b.specs.range) - parseRange(a.specs.range);
        case 'Range Low to High':
          return parseRange(a.specs.range) - parseRange(b.specs.range);
        case 'Top Speed High to Low':
          return parseTopSpeed(b.specs.topSpeed) - parseTopSpeed(a.specs.topSpeed);
        case 'Top Speed Low to High':
          return parseTopSpeed(a.specs.topSpeed) - parseTopSpeed(b.specs.topSpeed);
        default:
          return a.id - b.id; // Default: original order
      }
    });

  // Format Bitcoin price based on selected currency
  const btcPrice = (() => {
    const rate = currency === 'USD' ? usdRate : currency === 'GBP' ? gbpRate : eurRate;
    return rate
      ? new Intl.NumberFormat(currency === 'USD' ? 'en-US' : currency === 'GBP' ? 'en-GB' : 'de-DE', {
          style: 'currency',
          currency,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(rate)
      : 'N/A';
  })();

  return (
    <motion.div
      className="min-h-screen bg-gray-100 dark:bg-gray-800 py-8 transition-colors duration-300"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 relative">
        <ToastContainer
          position="top-center"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme={isDarkMode ? 'dark' : 'light'}
        />
        <button
          onClick={() => {
            console.log('Toggle clicked, new dark mode:', !isDarkMode);
            setIsDarkMode(!isDarkMode);
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors z-20 pointer-events-auto"
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 font-montserrat">
            Based Motors
          </h1>
          <h2 className="text-2xl font-medium text-gray-700 dark:text-gray-300 mt-2 font-montserrat">
            Electric Cars for Bitcoin
          </h2>
        </div>
        <motion.div
          className="sticky top-0 bg-gray-100 dark:bg-gray-800 z-10 pb-4 shadow-md"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-4 flex justify-center">
            <input
              type="text"
              placeholder="Search cars..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
              className="w-full max-w-3xl p-3 text-lg rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-inter"
            />
          </div>
          <div className="space-y-4 md:space-y-0 md:flex md:space-x-4">
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="w-full md:w-1/3 p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-inter"
            >
              <option value="All">All Brands</option>
              <option value="Tesla">Tesla</option>
              <option value="BYD">BYD</option>
              <option value="VW">Volkswagen</option>
              <option value="Rolls-Royce">Rolls-Royce</option>
              <option value="Mercedes">Mercedes</option>
            </select>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full md:w-1/3 p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-inter"
            >
              <option value="Default">Sort By...</option>
              <option value="Low to High">Price: Low to High</option>
              <option value="High to Low">Price: High to Low</option>
              <option value="Battery High to Low">Battery: High to Low</option>
              <option value="Battery Low to High">Battery: Low to High</option>
              <option value="Range High to Low">Range: High to Low</option>
              <option value="Range Low to High">Range: Low to High</option>
              <option value="Top Speed High to Low">Top Speed: High to Low</option>
              <option value="Top Speed Low to High">Top Speed: Low to High</option>
            </select>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full md:w-1/3 p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-inter"
            >
              <option value="USD">USD</option>
              <option value="GBP">GBP</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 flex justify-between items-center gap-2 mt-2">
            <div className="flex items-center gap-2">
              <span>Last Updated: {lastUpdated || 'N/A'}</span>
              <button
                onClick={() => {
                  console.log('Refresh button clicked');
                  fetchPrices(true); // Force refresh
                }}
                className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Refresh
              </button>
            </div>
            <span>BTC Price: {btcPrice}</span>
          </div>
        </motion.div>
        {error && <p className="text-red-500 dark:text-red-400 text-center mb-4 font-inter">{error}</p>}
        {checkout && (
          <Checkout
            car={checkout.car}
            paymentMethod={checkout.paymentMethod}
            currency={currency}
            usdRate={usdRate}
            gbpRate={gbpRate}
            eurRate={eurRate}
            onClose={closeCheckout}
          />
        )}
        {showCompareModal && (
          <CompareModal
            compareCars={compareCars}
            onClose={() => setShowCompareModal(false)}
            currency={currency}
            usdRate={usdRate}
            gbpRate={gbpRate}
            eurRate={eurRate}
            isDarkMode={isDarkMode}
          />
        )}
        {usdRate && gbpRate && eurRate && !checkout ? (
          <CarList
            cars={filteredCars}
            usdRate={usdRate}
            gbpRate={gbpRate}
            eurRate={eurRate}
            currency={currency}
            onCheckout={handleCheckout}
            compareCars={compareCars}
            setCompareCars={setCompareCars}
          />
        ) : (
          !checkout && (
            <p className="text-center text-gray-700 dark:text-gray-300 font-inter">Loading prices...</p>
          )
        )}
        {compareCars.length >= 2 && (
          <motion.div
            className="fixed bottom-4 flex justify-center w-full max-w-md gap-4 z-20"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
          >
            <button
              className="bg-gray-600 text-white py-3 px-4 rounded-full shadow-lg hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600 transition-colors font-inter flex items-center gap-2"
              onClick={handleResetCompare}
              aria-label="Reset comparison"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                  clipRule="evenodd"
                />
              </svg>
              Reset Compare
            </button>
            <button
              className="bg-blue-600 text-white py-3 px-6 rounded-full shadow-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors font-inter flex items-center gap-2"
              onClick={() => setShowCompareModal(true)}
            >
              <FaBalanceScale className="h-5 w-5" />
              Compare Now ({compareCars.length} cars)
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default App;