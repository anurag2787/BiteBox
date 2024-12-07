// postrecipepage.js
'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';
import 'draft-js/dist/Draft.css';
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  List,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Strikethrough,
  Quote,
  Code,
  Sun,
  Moon,
} from 'lucide-react';
import { UserAuth } from '../context/AuthContext';  
import { useDarkMode } from '../DarkModeContext'; // Import the hook

// Dynamically import Draft.js
const DraftJs = dynamic(() => import('draft-js'), { ssr: false });

const PostRecipePage = () => {
  const [mounted, setMounted] = useState(false);
  const [title, setTitle] = useState('');
  const [editorState, setEditorState] = useState(null);
  const [DraftModules, setDraftModules] = useState(null);
  const [loading, setLoading] = useState(false);

  const { user } = UserAuth(); 
  const { darkMode, toggleDarkMode } = useDarkMode(); // Get dark mode state and toggle function

  useEffect(() => {
    const loadDraftJs = async () => {
      const draftJs = await import('draft-js');
      setDraftModules(draftJs);
      setEditorState(draftJs.EditorState.createEmpty());
      setMounted(true);
    };

    loadDraftJs();
  }, []);

  const handleKeyCommand = (command) => {
    if (!DraftModules || !editorState) return 'not-handled';
    const newState = DraftModules.RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return 'handled';
    }
    return 'not-handled';
  };

  const toggleInlineStyle = (style) => {
    if (DraftModules && editorState) {
      setEditorState(DraftModules.RichUtils.toggleInlineStyle(editorState, style));
    }
  };

  const toggleBlockType = (blockType) => {
    if (DraftModules && editorState) {
      setEditorState(DraftModules.RichUtils.toggleBlockType(editorState, blockType));
    }
  };

  const handlePost = async () => {
    if (!mounted || !editorState || !user) return;

    const { convertToRaw } = DraftModules;
    const contentState = editorState.getCurrentContent();
    const content = JSON.stringify(convertToRaw(contentState));

    if (!title.trim() || contentState.getPlainText().trim() === '') {
      alert('Both title and content are required!');
      return;
    }

    setLoading(true);
    try {
      const token = await user.getIdToken(); // Get Firebase token from the authenticated user

      // Include the token in the headers
      const response = await axios.post('http://localhost:5000/api/recipes', 
        { title, content },
        { headers: { Authorization: `Bearer ${token}` } } // Send the token with the request
      );

      alert('Recipe posted successfully!');
      setTitle('');
      setEditorState(DraftModules.EditorState.createEmpty());
    } catch (error) {
      console.error('Error posting recipe:', error);
      alert('Failed to post recipe.');
    } finally {
      setLoading(false);
    }
  };

  const ToolbarButton = ({ onClick, children, active }) => (
    <button
      onClick={onClick}
      className={`p-2 rounded-md transition duration-200 ease-in-out ${
        active
          ? 'bg-blue-500 text-white shadow'
          : 'hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600 dark:text-gray-200'
      }`}
    >
      {children}
    </button>
  );

  if (!mounted) return null;

  return (
    <div
      className={`container mt-10 mx-auto max-w-5xl p-8 shadow-lg rounded-lg ${
        darkMode ? 'dark bg-gray-900 text-gray-200' : 'bg-gray-100 text-gray-800'
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold">Create Your Recipe</h1>
        <button
          onClick={toggleDarkMode} // Use the toggleDarkMode from context
          className="p-2 rounded-full transition-all duration-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="
            w-full text-2xl font-semibold
            border-b-2 border-gray-300 dark:border-gray-600
            px-4 py-2 
            focus:border-blue-500 
            transition 
            placeholder-gray-400 
            bg-transparent
          "
          placeholder="Recipe Title"
          required
        />
      </div>

      {/* Formatting Toolbar */}
      <div className="flex flex-wrap items-center bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-600 rounded-lg p-3 space-x-2 mb-4">
        <ToolbarButton onClick={() => toggleInlineStyle('BOLD')}>
          <Bold size={20} />
        </ToolbarButton>
        <ToolbarButton onClick={() => toggleInlineStyle('ITALIC')}>
          <Italic size={20} />
        </ToolbarButton>
        <ToolbarButton onClick={() => toggleInlineStyle('UNDERLINE')}>
          <Underline size={20} />
        </ToolbarButton>
        <ToolbarButton onClick={() => toggleInlineStyle('STRIKETHROUGH')}>
          <Strikethrough size={20} />
        </ToolbarButton>
        <ToolbarButton onClick={() => toggleBlockType('header-one')}>
          <Heading1 size={20} />
        </ToolbarButton>
        <ToolbarButton onClick={() => toggleBlockType('unordered-list-item')}>
          <List size={20} />
        </ToolbarButton>
        <ToolbarButton onClick={() => toggleBlockType('blockquote')}>
          <Quote size={20} />
        </ToolbarButton>
        <ToolbarButton onClick={() => toggleBlockType('code-block')}>
          <Code size={20} />
        </ToolbarButton>
        <ToolbarButton>
          <AlignLeft size={20} />
        </ToolbarButton>
        <ToolbarButton>
          <AlignCenter size={20} />
        </ToolbarButton>
        <ToolbarButton>
          <AlignRight size={20} />
        </ToolbarButton>
      </div>

      {/* Text Editor */}
      <div
        className="min-h-[300px] bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-inner p-4 text-gray-700 dark:text-gray-200"
      >
        {DraftModules && (
          <DraftModules.Editor
            editorState={editorState}
            onChange={setEditorState}
            handleKeyCommand={handleKeyCommand}
            placeholder="Start writing your recipe..."
            className="prose prose-lg focus:outline-none max-w-none dark:prose-invert"
          />
        )}
      </div>

      {/* Submit Button */}
      <div className="mt-6 text-center">
        <button
          onClick={handlePost}
          disabled={loading}
          className={`px-8 py-3 font-semibold rounded-lg shadow-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-600 transition ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Posting...' : 'Post Recipe'}
        </button>
      </div>
    </div>
  );
};

export default PostRecipePage;
