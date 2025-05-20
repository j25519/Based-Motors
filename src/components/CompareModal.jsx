import { motion } from 'framer-motion';

function CompareModal({ compareCars, onClose, currency, usdRate, gbpRate, eurRate, isDarkMode }) {
  const currencySymbol = currency === 'USD' ? '$' : currency === 'GBP' ? '£' : '€';

  const getFiatPrice = (car) => {
    switch (currency) {
      case 'USD':
        return (car.btcPrice * usdRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      case 'GBP':
        return (car.btcPrice * gbpRate).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      case 'EUR':
        return (car.btcPrice * eurRate).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      default:
        return '';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const columnVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="bg-white dark:bg-gray-900/80 backdrop-blur-md p-6 rounded-lg max-w-6xl w-full mx-4 text-gray-900 dark:text-white"
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-3xl font-bold mb-6 font-montserrat text-center">
          Compare Your Selected Cars
        </h2>
        {compareCars.length < 2 ? (
          <p className="font-inter text-center">Please select at least 2 cars to compare.</p>
        ) : (
          <motion.div
            className="flex flex-col md:flex-row gap-4 justify-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {compareCars.map((car) => (
              <motion.div
                key={car.id}
                className="flex-1 bg-gray-100 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-300 dark:border-gray-600 min-w-0"
                variants={columnVariants}
              >
                <div className="w-full h-48 mb-4">
                  <img
                    src={car.image}
                    alt={car.name}
                    className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-xl font-bold mb-4 font-montserrat text-center">{car.name}</h3>
                <ul className="space-y-2 font-inter text-sm">
                  <li><span className="font-bold">Price (BTC):</span> ₿{car.btcPrice.toFixed(4)}</li>
                  <li><span className="font-bold">Price ({currency}):</span> {currencySymbol}{getFiatPrice(car)}</li>
                  <li><span className="font-bold">Battery:</span> {car.specs.battery}</li>
                  <li><span className="font-bold">Range:</span> {car.specs.range}</li>
                  <li><span className="font-bold">0-60 mph:</span> {car.specs.zeroToSixty}</li>
                  <li><span className="font-bold">Top Speed:</span> {car.specs.topSpeed}</li>
                </ul>
              </motion.div>
            ))}
          </motion.div>
        )}
        <button
          onClick={onClose}
          className="mt-6 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors font-inter w-full"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
}

export default CompareModal;