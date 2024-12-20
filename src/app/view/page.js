"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { useDarkMode } from "../DarkModeContext";
import loader from "@/Components/loader";

const renderStyledContent = (content) => {
  if (!content || !content.blocks) return null;

  return content.blocks.map((block, index) => {
    const { text, type, inlineStyleRanges } = block;

    let StyledBlock;
    switch (type) {
      case "header-one":
        StyledBlock = (props) => (
          <h1
            className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100"
            {...props}
          />
        );
        break;
      case "header-two":
        StyledBlock = (props) => (
          <h2
            className="text-3xl font-semibold mb-3 text-gray-800 dark:text-gray-200"
            {...props}
          />
        );
        break;
      case "blockquote":
        StyledBlock = (props) => (
          <blockquote
            className="border-l-4 border-gray-400 pl-4 py-2 my-4 italic text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-r-lg"
            {...props}
          />
        );
        break;
      case "unstyled":
      default:
        StyledBlock = (props) => (
          <p
            className="text-lg leading-relaxed mb-4 text-gray-700 dark:text-gray-300"
            {...props}
          />
        );
    }

    let styledText = text;
    if (inlineStyleRanges.length > 0) {
      inlineStyleRanges.forEach((range) => {
        const { offset, length, style } = range;

        const start = styledText.slice(0, offset);
        const middle = styledText.slice(offset, offset + length);
        const end = styledText.slice(offset + length);

        let styledFragment;
        switch (style) {
          case "BOLD":
            styledFragment = (
              <strong className="font-bold text-gray-900 dark:text-gray-100">
                {middle}
              </strong>
            );
            break;
          case "ITALIC":
            styledFragment = (
              <em className="italic text-gray-700 dark:text-gray-300">
                {middle}
              </em>
            );
            break;
          case "UNDERLINE":
            styledFragment = (
              <u className="underline text-gray-800 dark:text-gray-200">
                {middle}
              </u>
            );
            break;
          default:
            styledFragment = middle;
        }

        styledText = (
          <>
            {start}
            {styledFragment}
            {end}
          </>
        );
      });
    }

    return <StyledBlock key={index}>{styledText}</StyledBlock>;
  });
};

const RecipeDetailsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [recipe, setRecipe] = useState(null);
  const [error, setError] = useState(null);
  const { darkMode } = useDarkMode();

  useEffect(() => {
    const id= searchParams.get("id");

    if (!id) {
      setError("Missing required recipe data");
      return;
    }

    const fetchRecipe = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/recipes/${encodeURIComponent(
            id)}`
        );
        setRecipe(response.data);
        console.log(response.data);
      } catch (err) {
        setError("Unable to load recipe details");
        console.error("Error fetching recipe details:", err);
      }
    };

    fetchRecipe();
  }, [searchParams]);

  if (error) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          darkMode ? "bg-gray-900 text-white" : "bg-white text-black"
        }`}
      >
        <p className="text-red-500 text-xl font-semibold">{error}</p>
      </div>
    );
  }

  if (!recipe) {
    return <div>{loader()}</div>;
  }

  const parsedContent = JSON.parse(recipe.content);

  return (
    <div
      className={`min-h-screen w-full py-12 px-4 transition-colors duration-300 ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 shadow-2xl rounded-2xl overflow-hidden transform transition-all hover:scale-[1.01]">
        <div className="relative h-[500px] w-full group">
          <img
            src={recipe.coverImage || "/placeholder-recipe.jpg"}
            alt={recipe.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.target.src = "/placeholder-recipe.jpg";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h1 className="text-5xl font-bold text-white drop-shadow-lg">
              {recipe.title}
            </h1>
          </div>
        </div>
        <div className="p-8 space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 pb-6 dark:border-gray-700">
            {recipe.author && (
              <p className="text-xl font-medium dark:text-gray-300">
                Created by:{" "}
                <span className="text-blue-600 dark:text-blue-400">
                  {recipe.author}
                </span>
              </p>
            )}
          </div>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            {renderStyledContent(parsedContent)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetailsPage;
