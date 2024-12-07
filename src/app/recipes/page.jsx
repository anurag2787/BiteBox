'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Correct API for App Directory
import axios from 'axios';

const RecipesPage = () => {
    const [recipes, setRecipes] = useState([]);
    const router = useRouter();

    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/recipes?limit=10');
                setRecipes(response.data);
            } catch (error) {
                console.error('Error fetching recipes:', error);
            }
        };

        fetchRecipes();
    }, []);

    const handleRecipeClick = (id) => {
        router.push(`/recipes/${id}`);
    };

    const handlePostRecipeClick = () => {
        router.push('/postrecipe');
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Recipes</h1>
                <button
                    onClick={handlePostRecipeClick}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    Post New Recipe
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recipes.map((recipe) => (
                    <div
                        key={recipe.id}
                        className="border rounded-lg p-4 cursor-pointer hover:shadow-lg"
                        onClick={() => handleRecipeClick(recipe.id)}
                    >
                        <h2 className="text-xl font-semibold mb-2">{recipe.title}</h2>
                        <p className="text-gray-700">{recipe.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecipesPage;
