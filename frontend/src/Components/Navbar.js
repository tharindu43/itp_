import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return React.createElement('nav', {
    className: 'navbar navbar-expand-lg navbar-dark bg-dark'
  },
    React.createElement('div', { className: 'container' },
      React.createElement(Link, { className: 'navbar-brand', to: '/' }, 'Grocery Manager'),
      React.createElement('div', { className: 'collapse navbar-collapse' },
        React.createElement('ul', { className: 'navbar-nav me-auto' },
          React.createElement('li', { className: 'nav-item' },
            React.createElement(Link, { className: 'nav-link', to: '/' }, 'Home')
          ),
          React.createElement('li', { className: 'nav-item' },
            React.createElement(Link, { className: 'nav-link', to: '/add' }, 'Add Item')
          )
        )
      )
    )
  );
};

export default Navbar;