'use client';

import { useState, useEffect } from 'react';

export default function DatingHome() {
  const [currentUser, setCurrentUser] = useState(null);
  const [matches, setMatches] = useState([]);

  // INTENTIONAL PROBLEM 1: Console.log statements (should be caught by cleanup hooks)
  console.log('Dating app loading...');
  console.log('Current user:', currentUser);

  useEffect(() => {
    // INTENTIONAL PROBLEM 2: More console.log usage
    console.log('Loading user data and matches');
    
    // Mock user loading
    setCurrentUser({
      id: 1,
      name: 'Test User',
      age: 25,
      bio: 'Love hiking and AI development',
      photos: ['/placeholder-profile.jpg']
    });

    setMatches([
      { id: 1, name: 'Alex', age: 28, photo: '/placeholder-1.jpg', distance: '2 miles away' },
      { id: 2, name: 'Sam', age: 24, photo: '/placeholder-2.jpg', distance: '5 miles away' },
      { id: 3, name: 'Jordan', age: 30, photo: '/placeholder-3.jpg', distance: '1 mile away' }
    ]);
  }, []);

  const handleSwipe = (direction, userId) => {
    // INTENTIONAL PROBLEM 3: More debugging console.log
    console.log(`Swiped ${direction} on user ${userId}`);
    
    if (direction === 'right') {
      console.log('It\'s a match!');
      // TODO: Handle match logic
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-rose-600">💕 LoveAI</h1>
          <div className="flex gap-2">
            <button className="p-2 rounded-full bg-white shadow-md">⚙️</button>
            <button className="p-2 rounded-full bg-white shadow-md">💬</button>
          </div>
        </div>

        {/* Main Card Stack */}
        <div className="relative h-96 mb-6">
          {matches.map((match, index) => (
            <div
              key={match.id}
              className="absolute inset-0 bg-white rounded-2xl shadow-lg overflow-hidden"
              style={{ 
                zIndex: matches.length - index,
                transform: `scale(${1 - index * 0.02}) translateY(${index * 4}px)`
              }}
            >
              {/* Profile Image */}
              <div className="h-3/4 bg-gray-200 relative">
                <img 
                  src={match.photo} 
                  alt={match.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                  }}
                />
                
                {/* Gradient overlay */}
                <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
                
                {/* Profile info */}
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-semibold">{match.name}, {match.age}</h3>
                  <p className="text-sm opacity-90">{match.distance}</p>
                </div>
              </div>

              {/* Quick actions */}
              <div className="h-1/4 p-4 flex items-center justify-between">
                <button 
                  onClick={() => handleSwipe('left', match.id)}
                  className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-500 text-xl hover:bg-red-200"
                >
                  ❌
                </button>
                
                <button className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 hover:bg-blue-200">
                  ⭐
                </button>
                
                <button 
                  onClick={() => handleSwipe('right', match.id)}
                  className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-500 text-xl hover:bg-green-200"
                >
                  ❤️
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Navigation */}
        <div className="flex justify-center gap-4">
          <button className="flex-1 py-3 bg-white rounded-xl shadow-md text-gray-600 font-medium">
            🔍 Discover
          </button>
          <button className="flex-1 py-3 bg-rose-500 text-white rounded-xl shadow-md font-medium">
            💕 Matches
          </button>
          <button className="flex-1 py-3 bg-white rounded-xl shadow-md text-gray-600 font-medium">
            👤 Profile
          </button>
        </div>
      </div>
    </main>
  );
}