import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Components/Navbar';
import Home from './pages/Home';
import AddGrocery from './pages/AddGrocery';
import GroceryDetail from './pages/GroceryDetail';
import './App.css';

function App() {
  return React.createElement(Router, null,
    React.createElement(Navbar),
    React.createElement('div', { className: 'container' },
      React.createElement(Routes, null,
        React.createElement(Route, { path: '/', element: React.createElement(Home) }),
        React.createElement(Route, { path: '/add', element: React.createElement(AddGrocery) }),
        React.createElement(Route, {
          path: '/groceries/:id',
          element: React.createElement(GroceryDetail)
        })
      )
    )
  );
}

export default App;