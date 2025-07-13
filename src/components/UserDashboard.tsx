// This component has multiple API anti-patterns that api-validator.js should detect

import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: string;
  name: string;
  email: string;
  profile: any;
}

export const UserDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // BAD: Multiple API calls in useEffect without proper handling
  useEffect(() => {
    // Anti-pattern: No cleanup, no error handling
    fetchUsers();
    fetchUserPreferences();
    fetchUserActivities();
    fetchNotifications();
    startPolling();
  }, []); // Missing dependencies

  // BAD: No error handling, no loading states
  const fetchUsers = async () => {
    const response = await fetch('/api/users');
    const data = await response.json();
    setUsers(data);
  };

  // BAD: Polling without cleanup
  const startPolling = () => {
    setInterval(() => {
      fetch('/api/notifications')
        .then(res => res.json())
        .then(data => console.log(data));
    }, 1000); // Too frequent polling
  };

  // BAD: Sequential API calls that could be parallel
  const fetchUserDetails = async (userId: string) => {
    const profile = await fetch(`/api/users/${userId}/profile`).then(r => r.json());
    const settings = await fetch(`/api/users/${userId}/settings`).then(r => r.json());
    const history = await fetch(`/api/users/${userId}/history`).then(r => r.json());
    const favorites = await fetch(`/api/users/${userId}/favorites`).then(r => r.json());
    
    return { profile, settings, history, favorites };
  };

  // BAD: API call in render method
  const renderUserActivities = (userId: string) => {
    // This will cause infinite re-renders
    fetch(`/api/users/${userId}/activities`)
      .then(res => res.json())
      .then(data => {
        // Directly setting state in render
        setUserActivities(data);
      });
  };

  // BAD: No request cancellation
  const searchUsers = async (query: string) => {
    // No debouncing, will fire on every keystroke
    const results = await fetch(`/api/search?q=${query}`).then(r => r.json());
    setSearchResults(results);
  };

  // BAD: Mixing fetch and axios inconsistently
  const updateUser = async (userId: string, data: any) => {
    // Using axios here but fetch elsewhere
    await axios.post(`/api/users/${userId}`, data);
    // No optimistic updates, no error handling
    fetchUsers(); // Refetching all users instead of updating one
  };

  // BAD: Creating multiple WebSocket connections
  const connectToUserSocket = (userId: string) => {
    // No cleanup, multiple connections per user
    const ws = new WebSocket(`ws://localhost:3000/users/${userId}`);
    ws.onmessage = (event) => {
      // Parsing without try-catch
      const data = JSON.parse(event.data);
      updateUserState(data);
    };
  };

  // BAD: Infinite scroll without virtualization
  const loadMoreUsers = async () => {
    const page = users.length / 20;
    const moreUsers = await fetch(`/api/users?page=${page}`).then(r => r.json());
    // Unbounded array growth
    setUsers([...users, ...moreUsers]);
  };

  // BAD: No request deduplication
  const getUserData = (userId: string) => {
    // Could be called multiple times with same ID
    return fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => {
        // Side effect in a getter function
        localStorage.setItem(`user_${userId}`, JSON.stringify(data));
        return data;
      });
  };

  // Helper functions referenced but not defined (more bad patterns)
  const fetchUserPreferences = async () => {};
  const fetchUserActivities = async () => {};
  const fetchNotifications = async () => {};
  const setUserActivities = (data: any) => {};
  const setSearchResults = (data: any) => {};
  const updateUserState = (data: any) => {};

  return (
    <div>
      {/* Component implementation */}
      <h1>User Dashboard</h1>
      {loading && <p>Loading...</p>}
      {users.map(user => (
        <div key={user.id} onClick={() => getUserData(user.id)}>
          {user.name}
        </div>
      ))}
    </div>
  );
};