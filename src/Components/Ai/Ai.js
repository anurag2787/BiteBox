"use client"
import React, { useState, useEffect } from "react";
import Link from "next/link";

function Ai() {
    // Initialize with default position, will be updated after mount
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [dragging, setDragging] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    
    // Set initial position after component mounts
    useEffect(() => {
        setPosition({ 
            x: window.innerWidth - 120, 
            y: window.innerHeight - 120 
        });
    }, []);

    // Set up global event listeners when dragging starts
    useEffect(() => {
        if (dragging) {
            // Add event listeners to document
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        } else {
            // Remove event listeners when not dragging
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        }
        
        // Cleanup function to remove listeners
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [dragging]); // Re-run effect when dragging state changes

    const handleMouseDown = (e) => {
        e.preventDefault(); // Prevent default behavior
        setDragging(true);
        setOffset({ 
            x: e.clientX - position.x, 
            y: e.clientY - position.y 
        });
    };

    const handleMouseMove = (e) => {
        if (!dragging) return;
        setPosition({
            x: e.clientX - offset.x,
            y: e.clientY - offset.y
        });
    };

    const handleMouseUp = () => {
        setDragging(false);
    };

    return (
        <Link href="/chat" passHref>
            <div
                className="fixed z-50 w-[100px] h-[100px] overflow-hidden rounded-full shadow-lg cursor-move"
                style={{
                    left: `${position.x}px`,
                    top: `${position.y}px`
                }}
                onMouseDown={handleMouseDown}
            >
                <img
                    src="https://herobot.app/wp-content/uploads/2022/11/AI-bot-1.jpg"
                    alt="AI Bot"
                    className="w-full h-full object-cover"
                />
                {/* <div className="w-full h-full bg-white flex items-center justify-center">
                    <span className="text-blue-500 text-sm font-bold">AI Bot</span>
                </div> */}
            </div>
        </Link>
    );
}

export default Ai;