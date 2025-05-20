import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import InfiniteScroll from 'react-infinite-scroll-component';
import CarCard from './CarCard';

function CarList({ cars, usdRate, gbpRate, eurRate, currency, onCheckout, compareCars, setCompareCars }) {
  const [displayedCars, setDisplayedCars] = useState(cars.slice(0, 6));
  const [hasMore, setHasMore] = useState(cars.length > 6);

  useEffect(() => {
  setDisplayedCars(cars.slice(0, 12));
  setHasMore(cars.length > 12);
}, [cars]);

  const loadMore = () => {
    const nextCars = cars.slice(displayedCars.length, displayedCars.length + 6);
    setDisplayedCars([...displayedCars, ...nextCars]);
    setHasMore(displayedCars.length + nextCars.length < cars.length);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <>
      <style>
        {`
          .hide-scrollbar {
            overflow: auto;
            scrollbar-width: none; /* Firefox */
            -ms-overflow-style: none; /* IE and Edge */
          }
          .hide-scrollbar::-webkit-scrollbar {
            display: none; /* Chrome, Safari, Opera */
          }
        `}
      </style>
      <InfiniteScroll
        dataLength={displayedCars.length}
        next={loadMore}
        hasMore={hasMore}
        loader={<p className="text-center text-gray-700 dark:text-gray-300 font-inter">Loading more cars...</p>}
        className="hide-scrollbar"
      >
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {displayedCars.map((car) => (
            <motion.div key={car.id} variants={cardVariants}>
              <CarCard
                car={car}
                usdRate={usdRate}
                gbpRate={gbpRate}
                eurRate={eurRate}
                currency={currency}
                onCheckout={onCheckout}
                compareCars={compareCars}
                setCompareCars={setCompareCars}
              />
            </motion.div>
          ))}
        </motion.div>
      </InfiniteScroll>
    </>
  );
}

export default CarList;