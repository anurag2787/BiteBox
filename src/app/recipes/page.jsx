"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Correct API for App Directory
import axios from "axios";
import { useDarkMode } from "../DarkModeContext";
import { UserAuth } from '../context/AuthContext';
import { Heart } from "lucide-react";

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
      router.push(`/view?id=${encodeURIComponent(recipe._id)}`);
    };
  
  

const handlePostRecipeClick = async () => {
    try {
        // Wait for 3 seconds to check user status
        await new Promise((resolve) => setTimeout(resolve, 2000));
        
        if (user) {
            router.push('/postrecipe');
        } else {
            alert('Only Registered Users can Post :)');
            router.push('/LoginPage');
        }
    } catch (error) {
        console.error('Error:', error);
    }
};

const likeClick = async (e, recipeId) => {
    e.stopPropagation(); // Prevent triggering the recipe card click
    try {
        if (!user) {
            alert('Please login to like recipes');
            return;
        }
        // Add your like functionality here
        const response = await axios.post(`http://localhost:5000/api/recipes/${recipeId}/like`, {
            userId: user.uid
        });
        // Update the recipes state with the new likes count
        setRecipes(recipes.map(recipe => 
            recipe._id === recipeId ? { ...recipe, likes: response.data.likes, isLiked: !recipe.isLiked } : recipe
        ));
    } catch (error) {
        console.error('Error liking recipe:', error);
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
                            <button onClick={(e) => likeClick(e, recipe._id)}>
                                <Heart
                                    fill={recipe.isLiked ? "#ec4899" : "none"}
                                    stroke={recipe.isLiked ? "#ec4899" : "currentColor"}
                                    className="w-6 h-6"
                                />
                            </button>
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