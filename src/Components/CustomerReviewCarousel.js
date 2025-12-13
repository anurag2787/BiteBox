import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import axios from 'axios';
import { useDarkMode } from '../app/DarkModeContext';

const CustomerReviewCarousel = () => {
  const [reviews, setReviews] = useState([]);
  const { darkMode } = useDarkMode();

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
  };

  // Fetch reviews from the backend
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/reviews`); // Replace with your actual backend API URL
        setReviews(response.data.data); // Assuming the reviews are in `data.data`
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };

    fetchReviews();
  }, []);

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl shadow-xl max-w-full sm:max-w-4xl mx-auto pb-6 ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      }`}
    >
      <h1
        className={`text-center font-bold text-3xl sm:text-3xl mb-3 ${
          darkMode ? 'text-white' : 'text-gray-800'
        }`}
      >
        What Our Customers Say
      </h1>
      <Slider {...settings}>
        {reviews.length > 0 ? (
          reviews.map((review, index) => (
            <div
              key={index}
              className="px-4"
            >
              <div
                className={`flex flex-col items-center justify-center text-center p-3 sm:p-4 rounded-xl ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}
              >
                {/* Rating Stars */}
                <div className="flex items-center justify-center gap-1 mb-1">
                  {[...Array(5)].map((_, idx) => (
                    <svg
                      key={idx}
                      xmlns="http://www.w3.org/2000/svg"
                      fill={idx < review.rating ? '#FCD34D' : 'none'}
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke={idx < review.rating ? '#FCD34D' : darkMode ? '#6B7280' : '#D1D5DB'}
                      className="w-7 h-7 sm:w-8 sm:h-8"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.518 4.674a1 1 0 00.95.69h4.908c.969 0 1.371 1.24.588 1.81l-3.973 2.884a1 1 0 00-.364 1.118l1.518 4.674c.3.921-.755 1.688-1.538 1.118l-3.973-2.884a1 1 0 00-1.176 0l-3.973 2.884c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.986 9.1c-.783-.57-.38-1.81.588-1.81h4.908a1 1 0 00.95-.69l1.518-4.674z"
                      />
                    </svg>
                  ))}
                </div>
                
                {/* Rating Score */}
                <div className={`text-xl font-bold mb-4 ${darkMode ? 'text-yellow-400' : 'text-yellow-500'}`}>
                  {review.rating}.0 / 5.0
                </div>
                
                {/* Review Text */}
                <p
                  className={`text-base sm:text-lg italic mb-6 leading-relaxed ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  &quot;{review.review}&quot;
                </p>
                
                {/* Customer Info */}
                <div className={`pt-4 border-t ${darkMode ? 'border-gray-600' : 'border-gray-300'} w-full`}>
                  <h3
                    className={`font-semibold text-lg ${
                      darkMode ? 'text-blue-400' : 'text-blue-600'
                    }`}
                  >
                    {review.email}
                  </h3>
                  <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {new Date(review.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="review-slide text-center">
            <p>No reviews available.</p>
          </div>
        )}
      </Slider>
    </div>
  );
};

export default CustomerReviewCarousel;
