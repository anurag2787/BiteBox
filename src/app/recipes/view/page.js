'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDarkMode } from '../../DarkModeContext';
import loader from '@/Components/loader';

const renderStyledContent = (content) => {
    if (!content || !content.blocks) return null;

    return content.blocks.map((block, index) => {
        const { text, type, inlineStyleRanges } = block;

        // Apply block-level styles
        let StyledBlock;
        switch (type) {
            case 'header-one':
                StyledBlock = (props) => <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100" {...props} />;
                break;
            case 'header-two':
                StyledBlock = (props) => <h2 className="text-3xl font-semibold mb-3 text-gray-800 dark:text-gray-200" {...props} />;
                break;
            case 'blockquote':
                StyledBlock = (props) => (
                    <blockquote
                        className="border-l-4 border-gray-400 pl-4 py-2 my-4 italic text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-r-lg"
                        {...props}
                    />
                );
                break;
            case 'unstyled':
            default:
                StyledBlock = (props) => <p className="text-lg leading-relaxed mb-4 text-gray-700 dark:text-gray-300" {...props} />;
        }

        // Apply inline styles (e.g., bold, italic)
        let styledText = text;
        if (inlineStyleRanges.length > 0) {
            inlineStyleRanges.forEach((range) => {
                const { offset, length, style } = range;

                // Wrap styled text
                const start = styledText.slice(0, offset);
                const middle = styledText.slice(offset, offset + length);
                const end = styledText.slice(offset + length);

                let styledFragment;
                switch (style) {
                    case 'BOLD':
                        styledFragment = <strong className="font-bold text-gray-900 dark:text-gray-100">{middle}</strong>;
                        break;
                    case 'ITALIC':
                        styledFragment = <em className="italic text-gray-700 dark:text-gray-300">{middle}</em>;
                        break;
                    case 'UNDERLINE':
                        styledFragment = <u className="underline text-gray-800 dark:text-gray-200">{middle}</u>;
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

        return (
            <StyledBlock key={index}>
                {styledText}
            </StyledBlock>
        );
    });
};

const RecipeDetailsPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [recipe, setRecipe] = useState(null);
    const [error, setError] = useState(null);
    const { darkMode } = useDarkMode();

    useEffect(() => {
        const recipeData = searchParams.get('data');
        if (recipeData) {
            try {
                const parsedRecipe = JSON.parse(decodeURIComponent(recipeData));

                if (!parsedRecipe.title || !parsedRecipe.content) {
                    throw new Error('Invalid recipe data structure');
                }

                setRecipe(parsedRecipe);
            } catch (error) {
                console.error('Error parsing recipe data:', error);
                setError('Unable to load recipe details');
                router.push('/recipes');
            }
        } else {
            router.push('/recipes');
        }
    }, [searchParams, router]);

    if (error) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
                <p className="text-red-500 text-xl font-semibold">{error}</p>
            </div>
        );
    }

    if (!recipe) {
        return (<div>
               {loader()}
        </div>
        );
    }

    const parsedContent = JSON.parse(recipe.content);

    return (
        <div
            className={`min-h-screen w-full py-12 px-4 transition-colors duration-300 ${
                darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'
            }`}
        >
            <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 shadow-2xl rounded-2xl overflow-hidden transform transition-all hover:scale-[1.01]">
                {/* Cover Image */}
                <div className="relative h-[500px] w-full group">
                    <img
                        src={recipe.coverImage || '/placeholder-recipe.jpg'}
                        alt={recipe.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                            e.target.src = '/placeholder-recipe.jpg';
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h1 className="text-5xl font-bold text-white drop-shadow-lg">{recipe.title}</h1>
                    </div>
                </div>

                {/* Recipe Details */}
                <div className="p-8 space-y-8">
                    {/* Metadata */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 pb-6 dark:border-gray-700">
                        <div className="mb-4 sm:mb-0">
                            {recipe.author && (
                                <p className="text-xl font-medium dark:text-gray-300 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                    Created by: <span className="ml-2 text-blue-600 dark:text-blue-400">{recipe.author}</span>
                                </p>
                            )}
                            {recipe.email && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                    </svg>
                                    {recipe.email}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center space-x-3 group cursor-pointer">
                            <span className="text-xl font-semibold transition-colors group-hover:text-red-600">{recipe.likes || 0}</span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                                className="w-7 h-7 text-red-500 transition-transform group-hover:scale-110"
                            >
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                        </div>
                    </div>

                    {/* Rendered Content */}
                    <div className="prose prose-lg dark:prose-invert max-w-none">
                        {renderStyledContent(parsedContent)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecipeDetailsPage;