// GroceryDetails.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FiEdit, FiDownload, FiArrowLeft } from 'react-icons/fi';
import './GroceryDetails.css';

const GroceryDetails = () => {
  const [grocery, setGrocery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGrocery = async () => {
      try {
        const response = await api.get(`/groceries/${id}`);
        setGrocery(response.data);
      } catch (err) {
        setError('Failed to load grocery details');
      } finally {
        setLoading(false);
      }
    };
    fetchGrocery();
  }, [id]);

  const generateItemReport = () => {
    const doc = new jsPDF();
    
    // Styled header
    doc.setFillColor(42, 54, 89);
    doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F');
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(`Grocery Report - ${grocery.name}`, 20, 25);
    
    // Report body
    autoTable(doc, {
      startY: 45,
      head: [['Field', 'Details']],
      body: [
        ['Category', grocery.category],
        ['Quantity', grocery.quantity],
        ['Price', `LKR ${grocery.price.toFixed(2)}`],
        ['Status', grocery.status],
        ['Purchased Date', new Date(grocery.purchasedDate).toLocaleDateString()],
        ['Expiry Date', grocery.expiryDate ? 
          new Date(grocery.expiryDate).toLocaleDateString() : 'N/A'],
        ['Notes', grocery.notes || 'No additional notes']
      ],
      styles: { 
        fontSize: 12,
        cellPadding: 8,
        lineColor: [224, 224, 224],
        lineWidth: 0.5,
      },
      headStyles: {
        fillColor: [42, 54, 89],
        textColor: 255,
        fontSize: 13,
        cellPadding: 10
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 60 },
        1: { cellWidth: 120 }
      }
    });

    doc.save(`grocery-report-${id}.pdf`);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="skeleton-card">
          <div className="skeleton-header"></div>
          <div className="skeleton-content"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-card">
          <div className="error-icon">⚠️</div>
          <h2>{error}</h2>
          <button onClick={() => navigate(-1)} className="back-button">
            <FiArrowLeft /> Back to List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grocery-details-container">
      <button onClick={() => navigate(-1)} className="back-button">
        <FiArrowLeft /> Back to List
      </button>

      <header className="detail-header">
        <h1 className="detail-title">{grocery.name}</h1>
        <div className="header-actions">
          <button 
            className="action-btn edit-btn"
            onClick={() => navigate(`/edit/${grocery._id}`)}
          >
            <FiEdit /> Edit Item
          </button>
          <button 
            className="action-btn report-btn"
            onClick={generateItemReport}
          >
            <FiDownload /> Generate Report
          </button>
        </div>
      </header>

      <div className="detail-card">
        <div className="detail-grid">
          <DetailItem label="Category">
            <span className="category-badge">{grocery.category}</span>
          </DetailItem>
          
          <DetailItem label="Quantity">
            <div className="quantity-value">{grocery.quantity}</div>
          </DetailItem>

          <DetailItem label="Price">
            <div className="price-value">LKR {grocery.price.toFixed(2)}</div>
          </DetailItem>

          <DetailItem label="Status">
            <span className={`status-badge ${grocery.status.toLowerCase()}`}>
              {grocery.status}
            </span>
          </DetailItem>

          <DetailItem label="Purchased Date">
            <div className="date-value">
              {new Date(grocery.purchasedDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </DetailItem>

          {grocery.expiryDate && (
            <DetailItem label="Expiry Date">
              <div className="date-value">
                {new Date(grocery.expiryDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </DetailItem>
          )}

          <DetailItem label="Notes" fullWidth>
            <div className="notes-content">
              {grocery.notes || 'No additional notes provided'}
            </div>
          </DetailItem>
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({ label, children, fullWidth }) => (
  <div className={`detail-item ${fullWidth ? 'full-width' : ''}`}>
    <label>{label}</label>
    <div className="detail-content">{children}</div>
  </div>
);

export default GroceryDetails;