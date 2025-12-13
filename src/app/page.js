'use client'
import React, { useState, useEffect } from 'react'
import Navbar from '@/Components/Navbar'
import Footer from '@/Components/Footer'
import Carousel from '@/Components/Carousel'
import Card from '@/Components/card'
import image1 from '../lib/pizza.jpg'
import image2 from '../lib/pizza2.jpg'
import image3 from '../lib/fries.jpg'
import image4 from '../lib/chow.jpg'
import image5 from '../lib/berger.jpg'
import Section from '@/Components/Section'
import { useDarkMode } from './DarkModeContext'
import './globals.css' // Import the CSS file where we'll define the blinking cursor class
import CustomerReviewCarousel from '@/Components/CustomerReviewCarousel'
import recipes from '../lib/Homepagerecipe.json'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { PenSquare, MessageCircle, Video, Users, ChefHat, Star } from 'lucide-react'
import { UserAuth } from './context/AuthContext' 

export default function Home() {
  const { darkMode } = useDarkMode()
  const router = useRouter()
  const { user } = UserAuth()

  // List of attributes
  const attributes = [
    'Adventurous',
    'Gourmet',
    'Sweet-Toothed',
    'Savory-Lover',
    'Spice Enthusiast',
    'Local Foodie',
    'Health-Conscious',
    'Vegan',
  ]

  const [currentAttribute, setCurrentAttribute] = useState('')
  const [index, setIndex] = useState(0)
  const [typing, setTyping] = useState(true)
  const [charIndex, setCharIndex] = useState(0)
  const [isPausing, setIsPausing] = useState(false)

  const handleFeatureClick = async (path) => {
    if (!user && (path === '/postrecipe' || path === '/streams/startnewlive')) {
      alert('Please login to access this feature')
      router.push('/LoginPage')
      return
    }
    router.push(path)
  }

  const features = [
    {
      title: 'Post Recipe',
      description: 'Share your favorite recipes with the community',
      icon: <PenSquare className="w-8 h-8" />,
      path: '/postrecipe'
    },
    {
      title: 'Community Chat',
      description: 'Connect with fellow food lovers',
      icon: <MessageCircle className="w-8 h-8" />,
      path: '/post'
    },
    {
      title: 'Start Live Stream',
      description: 'Broadcast your cooking sessions live',
      icon: <Video className="w-8 h-8" />,
      path: '/streams/startnewlive'
    },
    {
      title: 'Browse Recipes',
      description: 'Explore thousands of delicious recipes',
      icon: <ChefHat className="w-8 h-8" />,
      path: '/recipes'
    }
  ]

  useEffect(() => {
    let timeout

    if (typing) {
      if (charIndex < attributes[index].length) {
        timeout = setTimeout(() => {
          setCurrentAttribute((prev) => prev + attributes[index][charIndex])
          setCharIndex((prev) => prev + 1)
        }, 100)
      } else {
        setTyping(false)
        setIsPausing(true)
        timeout = setTimeout(() => setIsPausing(false), 0) // Pause after typing
      }
    } else if (!typing && !isPausing) {
      if (charIndex > 0) {
        timeout = setTimeout(() => {
          setCurrentAttribute((prev) => prev.slice(0, -1))
          setCharIndex((prev) => prev - 1)
        }, 150) // Detyping speed
      } else {
        setTyping(true)
        setIndex((prevIndex) => (prevIndex + 1) % attributes.length)
      }
    }

    return () => clearTimeout(timeout)
  }, [typing, charIndex, index, isPausing])

  return (
    <main>
      <Section>
        <Carousel />
      </Section>

      {/* Hero Section with Typing Effect */}
      <div
        className={`flex flex-col items-center text-center ${darkMode ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-blue-50 to-purple-50'
          } p-8 mb-8 w-full rounded-2xl justify-center shadow-lg`}
      >
        <h2
          className={`text-4xl md:text-5xl font-bold font-mono flex-initial w-full ${darkMode ? 'text-white' : 'text-gray-800'
            }`}
          style={{ marginBottom: '10px' }}
        >
          Are You A {currentAttribute}
          <span className='blinking-cursor'>|</span> Foodie?
        </h2>

        <h3 className={`text-xl md:text-2xl mt-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} style={{ fontFamily: 'monospace' }}>
          We have got you covered!
        </h3>
      </div>

      {/* Quick Access Features Section */}
      <Section>
        <div className="mb-12">
          <h2 className={`text-3xl md:text-4xl font-bold text-center mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Explore Our Features
          </h2>
          <p className={`text-center text-lg mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Everything you need to share, learn, and connect with food enthusiasts
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <div
                key={idx}
                onClick={() => handleFeatureClick(feature.path)}
                className={`${darkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'} 
                  p-6 rounded-xl shadow-lg cursor-pointer border-2 ${darkMode ? 'border-gray-700' : 'border-gray-200'}
                  transform transition-all duration-300 hover:scale-105 hover:shadow-2xl
                  flex flex-col items-center text-center group`}
              >
                <div className={`${darkMode ? 'bg-blue-600' : 'bg-blue-500'} p-4 rounded-full mb-4 group-hover:bg-blue-600 transition-all`}>
                  <div className="text-white">{feature.icon}</div>
                </div>
                <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{feature.title}</h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Featured Recipes Section */}
      <Section customStyle={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'} py-8 rounded-2xl`}>
        <div className='mt-6 mx-auto w-full'>
          <h2 className={`text-3xl md:text-4xl font-bold text-center mb-8 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Featured Recipes
          </h2>
          <div className='grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
            {recipes.map((recipe) => (
              <Card
                key={recipe.id}
                id={recipe.id}
                imageSrc={recipe.imageLink}
                title={recipe.title}
                description={
                  recipe.instruction.slice(0, 50) + '...'
                }
              />)
            )}
          </div>
        </div>
      </Section>

      {/* Customer Reviews Section */}
      <Section>
        <CustomerReviewCarousel />
      </Section>

      {/* Rate Us Section */}
      <Section>
        <div className={`flex flex-col items-center justify-center mx-auto w-full sm:w-3/4 md:w-2/3 lg:w-1/2 p-4 sm:p-6 ${
          darkMode ? 'bg-gray-700 text-white' : 'bg-slate-200 text-black'
        } rounded-xl shadow-md mb-8`}>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 text-center">Enjoyed our service?</h3>
          <p className="text-base sm:text-lg mb-3 sm:mb-4 text-center">Share your experience with us!</p>
          <button 
            onClick={() => router.push('/custoratings')} 
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base rounded-lg transition duration-300 transform hover:scale-105"
          >
            Rate Us
          </button>
        </div>
      </Section>

      <Footer />
    </main>
  )
}
