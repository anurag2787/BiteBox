"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/legacy/image";
import { UserAuth } from "../context/AuthContext";
import { Heart, Search, X } from "lucide-react";
import Loader from "@/Components/loader";

const RecipesPage = () => {
  const [recipes, setRecipes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const router = useRouter();
  const { user } = UserAuth();

  const categories = [
    "All",
    "Appetizer",
    "Main Course",
    "Dessert",
    "Breakfast",
    "Lunch",
    "Dinner",
    "Snack",
    "Beverage",
    "Salad",
    "Soup"
  ];

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_API}/api/recipes?limit=100`
        );
        setRecipes(response.data);
      } catch (error) {
        console.error("Error fetching recipes:", error);
      }
    };

    fetchRecipes();
  }, []);

  // Memoized filtering - prevents unnecessary recalculations
  const filteredRecipes = useMemo(() => {
    let filtered = recipes;

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter(
        (recipe) => recipe.category === selectedCategory
      );
    }

    // Filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((recipe) =>
        recipe.title.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [recipes, selectedCategory, searchQuery]);

  // Get search suggestions
  const searchSuggestions = useMemo(() => {
    if (searchQuery.trim() === "" || !showSuggestions) return [];
    
    const query = searchQuery.toLowerCase();
    return recipes
      .filter((recipe) => recipe.title.toLowerCase().includes(query))
      .slice(0, 5) // Limit to 5 suggestions
      .map((recipe) => recipe.title);
  }, [recipes, searchQuery, showSuggestions]);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setShowSuggestions(false);
  };

  const handleRecipeClick = (recipe) => {
    router.push(`/view?id=${encodeURIComponent(recipe._id)}`);
  };

  const handlePostRecipeClick = async () => {
    try {
      // Wait for 3 seconds to check user status
      await new Promise((resolve) => setTimeout(resolve, 2000));

      if (user) {
        router.push("/postrecipe");
      } else {
        alert("Only Registered Users can Post :)");
        router.push("/LoginPage");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const likeClick = async (e, recipeId) => {
    e.stopPropagation(); // Prevent triggering the recipe card click

    if (!user) {
      alert("Please login to like recipes");
      return;
    }

    const userId = user.email; // Use user email as the unique userId
    const recipe = recipes.find((recipe) => recipe._id === recipeId);
    if (!recipe) return;

    // Check if the user already liked the recipe
    const alreadyLiked =
      Array.isArray(recipe.likes) && recipe.likes.some((like) => like.userId === userId);

    if (alreadyLiked) {
      alert("You have already liked this recipe!");
      return;
    }

    // Optimistically update the UI for like count and heart color
    setRecipes((prevRecipes) =>
      prevRecipes.map((recipe) =>
        recipe._id === recipeId
          ? { ...recipe, likes: [...recipe.likes, { userId }] }
          : recipe
      )
    );

    // Send the like request to the backend
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/api/recipes/${recipeId}/like`,
        { userId }
      );

      // Update the recipes state with the new likes after server response
      setRecipes((prevRecipes) =>
        prevRecipes.map((recipe) =>
          recipe._id === recipeId
            ? { ...recipe, likes: response.data.likes }
            : recipe
        )
      );
    } catch (error) {
      console.error("Error liking recipe:", error);
      // Revert UI change if there was an error
      setRecipes((prevRecipes) =>
        prevRecipes.map((recipe) =>
          recipe._id === recipeId ? { ...recipe, likes: recipe.likes.slice(0, -1) } : recipe
        )
      );
    }
  };

  return (
    <div className="container mx-auto p-4">
      {/* Header with Title and Post Recipe Button */}
      <div className="flex justify-between items-center m-6 mb-6">
        <h1 className="text-3xl font-bold">Recipes</h1>
        <button
          onClick={handlePostRecipeClick}
          className="bg-blue-500 text-white ml-2 md:ml-0 md:text-sm text-xs px-4 py-2 rounded-xl hover:bg-blue-600"
        >
          Post New Recipe
        </button>
      </div>

      {/* Search Bar */}
      <div className="mx-6 mb-6 flex justify-end">
        <div className="relative w-full md:w-64">
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Search Here"
            className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white"
          />
          
          {/* Search Suggestions Dropdown */}
          {showSuggestions && searchSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {searchSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-black border-b border-gray-100 last:border-b-0"
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <div className="mx-6 mb-8">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryClick(category)}
              className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                selectedCategory === category
                  ? "bg-blue-500 text-white shadow-lg transform scale-105"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div className="mx-6 mb-4">
        <p className="text-gray-600 dark:text-gray-400">
          Showing {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? "s" : ""}
          {selectedCategory !== "All" && ` in ${selectedCategory}`}
          {searchQuery && ` matching "${searchQuery}"`}
        </p>
      </div>

      {recipes.length === 0 && (<div className="w-full"><Loader/></div>)}
      
      {/* No results message */}
      {recipes.length > 0 && filteredRecipes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-xl text-gray-500 dark:text-gray-400">
            No recipes found. Try a different search or category.
          </p>
        </div>
      )}

      {/* Recipe Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRecipes.length > 0 && (
          <>
            {filteredRecipes.map((recipe) => (
            <div
              key={recipe._id}
              className="border rounded-lg p-4 cursor-pointer hover:shadow-lg"
              onClick={() => handleRecipeClick(recipe)}
            >
              {/* Cover Image */}
              <Image
                src={recipe.coverImage}
                alt={recipe.title}
                width={400}
                height={192}
                className="w-full h-48 object-cover rounded-md mb-4"
              />
              {/* Title and Likes */}
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">{recipe.title}</h2>
                <div className="flex items-center">
                  <button onClick={(e) => likeClick(e, recipe._id)}>
                    <Heart
                      fill={
                        Array.isArray(recipe.likes) &&
                        recipe.likes.some((like) => like.userId === user?.email)
                          ? "#ec4899"
                          : "none"
                      }
                      stroke={
                        Array.isArray(recipe.likes) &&
                        recipe.likes.some((like) => like.userId === user?.email)
                          ? "#ec4899"
                          : "currentColor"
                      }
                      className="w-6 h-6"
                    />
                  </button>
                  <span className="text-lg ml-2">
                    {Array.isArray(recipe.likes) ? recipe.likes.length : 0}
                  </span>
                </div>
              </div>
            </div>
          ))}
          </>
        )}
      </div>
    </div>
  );
};

export default RecipesPage;
