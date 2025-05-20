import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { FaBitcoin, FaBolt, FaPlus, FaMinus } from 'react-icons/fa';
import { useState } from 'react';

function CarCard({ car, usdRate, gbpRate, eurRate, currency, onCheckout, compareCars, setCompareCars }) {
  const [noAnimation, setNoAnimation] = useState(false);

  const btcPriceNum = Number(car.btcPrice);
  const isValidPrice = !isNaN(btcPriceNum);

  const fiatPrice = (() => {
    if (!isValidPrice) return 'N/A';
    const value = btcPriceNum * (currency === 'USD' ? usdRate : currency === 'GBP' ? gbpRate : eurRate);
    return new Intl.NumberFormat(currency === 'USD' ? 'en-US' : currency === 'GBP' ? 'en-GB' : 'de-DE', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  })();

//  const currencySymbol = currency === 'USD' ? '$' : currency === 'GBP' ? '£' : '€';

  const handleCompare = () => {
    console.log('compareCars:', compareCars);
    setNoAnimation(true);
    if (compareCars.some(c => c.id === car.id)) {
      setCompareCars(compareCars.filter((c) => c.id !== car.id));
    } else if (compareCars.length < 4) {
      setCompareCars([...compareCars, car]);
    } else {
      toast.error('You can compare up to 4 cars at a time.', {
        position: 'top-center',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
    setTimeout(() => setNoAnimation(false), 100);
  };

  return (
    <>
      <style>
        {`
          .no-animation, .no-animation * {
            transform: none !important;
            box-shadow: none !important;
            transition: none !important;
          }
        `}
      </style>
      <motion.div
        className={`group bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md min-h-0 ${noAnimation ? 'no-animation' : ''}`}
        whileHover={{ scale: 1.05, boxShadow: '0 8px 16px rgba(0,0,0,0.2)' }}
        transition={{ duration: 0.3 }}
      >
        <div className="w-full h-64 mb-4">
          <img
            src={car.image}
            alt={car.name}
            className="w-full h-full object-contain"
          />
        </div>
        <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100 font-montserrat">{car.name}</h3>
        <p className="text-gray-700 dark:text-gray-300 font-inter">
          BTC: ₿{isValidPrice ? btcPriceNum.toFixed(4) : 'N/A'}
        </p>
        <p className="text-gray-700 dark:text-gray-300 font-inter">
          {currency}: {fiatPrice}
        </p>
        <div className="hidden group-hover:block mt-4 space-y-2 md:block">
          <p className="text-gray-600 dark:text-gray-400 text-sm font-inter">
            Battery: {car.specs.battery}
          </p>
          <p className="text-gray-600 dark:text-gray-400 text-sm font-inter">
            Range: {car.specs.range}
          </p>
          <p className="text-gray-600 dark:text-gray-400 text-sm font-inter">
            0-60 mph: {car.specs.zeroToSixty}
          </p>
          <p className="text-gray-600 dark:text-gray-400 text-sm font-inter">
            Top Speed: {car.specs.topSpeed}
          </p>
          <div className="flex space-x-2 mt-4">
            <button
              onClick={() => onCheckout(car, 'Bitcoin')}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors font-inter flex items-center justify-center gap-2"
              aria-label={`Buy ${car.name} with Bitcoin`}
            >
              <FaBitcoin className="h-5 w-5" />
              Buy with Bitcoin
            </button>
            <button
              onClick={() => onCheckout(car, 'Bitcoin Lightning')}
              className="flex-1 bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 dark:bg-yellow-400 dark:hover:bg-yellow-500 transition-colors font-inter flex items-center justify-center gap-2"
              aria-label={`Buy ${car.name} with Bitcoin Lightning`}
            >
              <FaBolt className="h-5 w-5" />
              Buy with Bitcoin Lightning
            </button>
          </div>
          <div className="flex justify-center mt-2">
            <button
              onClick={handleCompare}
              className={`w-full max-w-xs py-2 rounded-lg text-white transition-colors font-inter flex items-center justify-center gap-2 ${
                compareCars.some(c => c.id === car.id)
                  ? 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600'
                  : 'bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600'
              }`}
              aria-label={compareCars.some(c => c.id === car.id) ? `Remove ${car.name} from comparison` : `Add ${car.name} to comparison`}
            >
              {compareCars.some(c => c.id === car.id) ? <FaMinus className="h-5 w-5" /> : <FaPlus className="h-5 w-5" />}
              {compareCars.some(c => c.id === car.id) ? 'Remove from Compare' : 'Add to Compare'}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

export default CarCard;