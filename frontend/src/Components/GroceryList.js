import React from 'react';
import { Link } from 'react-router-dom';

const GroceryList = ({ groceries, loading, error, onDelete }) => {
  if (loading) return React.createElement(Spinner);
  if (error) return React.createElement('div', { className: 'alert alert-danger' }, error);

  return React.createElement('div', { className: 'row' },
    groceries.map((grocery) =>
      React.createElement('div', { className: 'col-md-4 mb-4', key: grocery._id },
        React.createElement('div', { className: 'card' },
          React.createElement('div', { className: 'card-body' },
            React.createElement('h5', { className: 'card-title' }, grocery.name),
            React.createElement('p', { className: 'card-text' },
              'Category: ', grocery.category, React.createElement('br'),
              'Quantity: ', grocery.quantity, React.createElement('br'),
              'Price: $', grocery.price
            ),
            React.createElement('div', { className: 'd-flex justify-content-between' },
              React.createElement(Link, { 
                to: `/groceries/${grocery._id}`,
                className: 'btn btn-primary'
              }, 'View Details'),
              React.createElement('button', {
                onClick: () => onDelete(grocery._id),
                className: 'btn btn-danger'
              }, 'Delete')
            )
          )
        )
      )
    )
  );
};

export default GroceryList;