import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
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
    doc.setFontSize(20);
    doc.setTextColor(40, 62, 104);
    doc.setFont('helvetica', 'bold');
    doc.text(`Grocery Item Report - ${grocery.name}`, 20, 25);
    
    // Report subtitle
    doc.setFontSize(12);
    doc.setTextColor(120);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 32);

    // Item details table
    autoTable(doc, {
      startY: 40,
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
        cellPadding: 8,
        lineColor: [224, 224, 224],
        lineWidth: 0.5,
      },
      headStyles: {
        fillColor: [40, 62, 104],
        textColor: 255,
        fontSize: 13,
        cellPadding: 10
      },
      columnStyles: {
        0: { 
          fontStyle: 'bold', 
          cellWidth: 70,
          textColor: [40, 62, 104]
        },
        1: { 
          cellWidth: 110,
          textColor: [70, 70, 70]
        }
      }
    });

    doc.save(`grocery-item-${grocery._id}-report.pdf`);
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!grocery) return <div className="loading-spinner">Loading...</div>;

  return (
    <div className="grocery-details-container">
      <header className="detail-header">
        <h1 className="detail-title">{grocery.name}</h1>
        <div className="header-actions">
          <button 
            className="action-btn edit-btn"
            onClick={() => window.location.href = `/edit/${grocery._id}`}
          >
            Edit Item
          </button>
          <button 
            className="action-btn report-btn"
            onClick={generateItemReport}
          >
            Download Report
          </button>
        </div>
      </header>

      <div className="detail-card">
        <div className="detail-card-body">
          <div className="detail-grid">
            <div className="detail-item">
              <label>Category</label>
              <span className="category-badge">{grocery.category}</span>
            </div>
            
            <div className="detail-item">
              <label>Quantity</label>
              <div className="detail-value quantity-value">{grocery.quantity}</div>
            </div>

            <div className="detail-item">
              <label>Price</label>
              <div className="detail-value price-value">${grocery.price.toFixed(2)}</div>
            </div>

            <div className="detail-item">
              <label>Status</label>
              <span className={`status-badge ${grocery.status.toLowerCase().replace(' ', '-')}`}>
                {grocery.status}
              </span>
            </div>

            <div className="detail-item">
              <label>Purchased Date</label>
              <div className="detail-value date-value">
                {new Date(grocery.purchasedDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>

            {grocery.expiryDate && (
              <div className="detail-item">
                <label>Expiry Date</label>
                <div className="detail-value date-value">
                  {new Date(grocery.expiryDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            )}

            <div className="detail-item full-width">
              <label>Notes</label>
              <div className="notes-content">{grocery.notes || 'No additional notes'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroceryDetails;