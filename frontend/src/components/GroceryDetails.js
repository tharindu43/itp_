// src/components/GroceryDetails.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Alert, Button } from 'react-bootstrap';
import api from '../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './GroceryDetails.css';

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

  const generateItemReport = () => {
    const doc = new jsPDF();
    
    // Report header
    doc.setFontSize(18);
    doc.text(`Grocery Item Report - ${grocery.name}`, 20, 20);
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Report generated: ${new Date().toLocaleDateString()}`, 20, 27);

    // Item details table
    autoTable(doc, {
      startY: 35,
      head: [['Field', 'Value']],
      body: [
        ['Category:', grocery.category],
        ['Quantity:', grocery.quantity],
        ['Price:', `$${grocery.price.toFixed(2)}`],
        ['Status:', grocery.status],
        ['Purchased Date:', new Date(grocery.purchasedDate).toLocaleDateString()],
        ['Expiry Date:', grocery.expiryDate ? 
          new Date(grocery.expiryDate).toLocaleDateString() : 'N/A'],
        ['Notes:', grocery.notes || 'N/A']
      ],
      theme: 'grid',
      styles: { 
        fontSize: 12,
        cellPadding: 3,
        overflow: 'linebreak'
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontSize: 13
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 60 },
        1: { cellWidth: 120 }
      }
    });

    doc.save(`grocery-item-${grocery._id}-report.pdf`);
  };

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!grocery) return <div>Loading...</div>;

  return (
    <div className="grocery-details">
      <h2>{grocery.name}</h2>
      <Card className="detail-card">
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
          <div className="button-group">
            <Button variant="primary" href={`/edit/${grocery._id}`}>
              Edit
            </Button>
            <Button 
              variant="success" 
              onClick={generateItemReport}
              className="ms-2"
            >
              Generate Report
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default GroceryDetails;