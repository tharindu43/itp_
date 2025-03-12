// src/components/GroceryList.js
import React, { useEffect, useState } from 'react';
import { Table, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../services/api';

const GroceryList = () => {
  const [groceries, setGroceries] = useState([]);

  useEffect(() => {
    fetchGroceries();
  }, []);

  const fetchGroceries = async () => {
    try {
      const response = await api.get('/groceries');
      setGroceries(response.data.data);
    } catch (error) {
      console.error('Error fetching groceries:', error);
    }
  };

  const deleteGrocery = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await api.delete(`/groceries/${id}`);
        fetchGroceries();
      } catch (error) {
        console.error('Error deleting grocery:', error);
      }
    }
  };

  return (
    <div>
      <h2>Grocery List</h2>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {groceries.map((grocery) => (
            <tr key={grocery._id}>
              <td>{grocery.name}</td>
              <td>
                <Badge bg="secondary">{grocery.category}</Badge>
              </td>
              <td>{grocery.quantity}</td>
              <td>${grocery.price.toFixed(2)}</td>
              <td>
                <Badge bg={grocery.status === 'Available' ? 'success' : 'danger'}>
                  {grocery.status}
                </Badge>
              </td>
              <td>
                <Button as={Link} to={`/grocery/${grocery._id}`} variant="info" size="sm">
                  View
                </Button>{' '}
                <Button as={Link} to={`/edit/${grocery._id}`} variant="warning" size="sm">
                  Edit
                </Button>{' '}
                <Button variant="danger" size="sm" onClick={() => deleteGrocery(grocery._id)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default GroceryList;