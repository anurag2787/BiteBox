'use client'

import Link from 'next/link'
import Image from "next/legacy/image"
import { useRouter } from "next/navigation"; // Correct API for App Directory
import { useDarkMode } from '../app/DarkModeContext'

const Card = ({ id, imageSrc, title, description }) => {
  const router = useRouter();
  const { darkMode } = useDarkMode();
  const handleinstructionpage = (meal) => {
    router.push(`/homemenuview?id=${encodeURIComponent(id)}`);
  };
  return (
      <a className={`mb-6 block w-full max-w-sm mx-auto overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transform hover:scale-105 transition-transform duration-300 ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <Image
          src={imageSrc}
          alt={title}
          width={400}
          height={250}
          className='w-full h-48 object-cover'
        />
        <div className='p-4'>
          <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{title}</h2>
          <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{description}</p>
        </div>
        <div className='mb-4 flex justify-center items-center'>
          <button onClick={handleinstructionpage} className='w-32 h-10 bg-yellow-400 text-gray-600 rounded-full hover:bg-yellow-500 animation hover:font-semibold'>Recipe</button>
        </div>
      </a>
  )
}

export default Card
