// src/components/GroceryDetails.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Alert, Button } from 'react-bootstrap';
import api from '../services/api';

const GroceryDetails = () => {
  const [grocery, setGrocery] = useState(null);
  const [error, setError] = useState('');
  const { id } = useParams();

  useEffect(() => {
    fetchGrocery();
  }, [id]);

  const fetchGrocery = async () => {
    try {
      const response = await api.get(`/groceries/${id}`);
      setGrocery(response.data);
    } catch (error) {
      setError('Grocery not found');
    }
  };

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!grocery) return <div>Loading...</div>;

  return (
    <div>
      <h2>{grocery.name}</h2>
      <Card>
        <Card.Body>
          <Card.Text>
            <strong>Category:</strong> {grocery.category}<br />
            <strong>Quantity:</strong> {grocery.quantity}<br />
            <strong>Price:</strong> ${grocery.price.toFixed(2)}<br />
            <strong>Status:</strong> {grocery.status}<br />
            <strong>Purchased Date:</strong> {new Date(grocery.purchasedDate).toLocaleDateString()}<br />
            {grocery.expiryDate && (
              <>
                <strong>Expiry Date:</strong> {new Date(grocery.expiryDate).toLocaleDateString()}<br />
              </>
            )}
            <strong>Notes:</strong> {grocery.notes || 'N/A'}
          </Card.Text>
          <Button variant="primary" href={`/edit/${grocery._id}`}>
            Edit
          </Button>
        </Card.Body>
      </Card>
    </div>
  );
};

export default GroceryDetails;
