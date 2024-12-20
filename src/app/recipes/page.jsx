"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Correct API for App Directory
import axios from "axios";
import { useDarkMode } from "../DarkModeContext";
import { UserAuth } from '../context/AuthContext';

const RecipesPage = () => {
  const [recipes, setRecipes] = useState([]);
  const router = useRouter();
  const {user} = UserAuth();


  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/recipes?limit=100"
        );
        setRecipes(response.data);
      } catch (error) {
        console.error("Error fetching recipes:", error);
      }
    };

    fetchRecipes();
  }, []);

  const handleRecipeClick = (recipe) => {
    const query = encodeURIComponent(JSON.stringify(recipe));
    router.push(`/recipes/view?data=${query}`);
  };

  const handlePostRecipeClick = () => {
    if(user){
            router.push('/postrecipe');
        }
        else{
            alert('Only Register User an Post :)')
            router.push('/LoginPage');
        }
  };

  return (
    <div className="container mx-auto p-4">
      {/* Header with Title and Post Recipe Button */}
      <div className="flex justify-between items-center m-6 mb-10">
        <h1 className="text-3xl font-bold">Recipes</h1>
        <button
          onClick={handlePostRecipeClick}
          className="bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600"
        >
          Post New Recipe
        </button>
      </div>

      {/* Recipe Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recipes.map((recipe, index) => (
          <div
            key={index}
            className="border rounded-lg p-4 cursor-pointer hover:shadow-lg"
            onClick={() => handleRecipeClick(recipe)}
          >
            {/* Cover Image */}
            <img
              src={recipe.coverImage}
              alt={recipe.title}
              className="w-full h-48 object-cover rounded-md mb-4"
            />
            {/* Title and Likes */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">{recipe.title}</h2>
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-red-500 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-lg">{recipe.likes}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecipesPage;