import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Form, Dropdown, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { saveAs } from 'file-saver';
import api from '../../services/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { FiPlus, FiSearch, FiFilter, FiDownload, FiEdit, FiTrash, FiInfo } from 'react-icons/fi';
import './GroceryList.css';

const GroceryList = () => {
  // State management
  const [groceries, setGroceries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  // Data fetching
  const fetchGroceries = useCallback(async () => {
    try {
      const response = await api.get('/groceries');
      setGroceries(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching groceries:', error);
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get('/groceries/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  useEffect(() => {
    fetchGroceries();
    fetchCategories();
  }, [fetchGroceries, fetchCategories]);

  // Grocery item deletion
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

  // Report generation
  const generateCSVReport = () => {
    const headers = ['Name', 'Category', 'Quantity', 'Price', 'Status', 'Purchased Date', 'Expiry Date', 'Notes'];
    const csvContent = [
      headers.join(','),
      ...filteredGroceries.map(item => [
        `"${item.name}"`,
        item.category,
        item.quantity,
        item.price.toFixed(2),
        item.status,
        new Date(item.purchasedDate).toISOString().split('T')[0],
        item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : 'N/A',
        item.notes ? `"${item.notes.replace(/"/g, '""')}"` : ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `groceries-report-${new Date().toISOString().slice(0,10)}.csv`);
  };

  const generatePDFReport = () => {
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    };

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Report title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text("Grocery Inventory Report", pageWidth / 2, 15, { align: 'center' });
    
    // Report generation date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);
    
    // Table configuration
    doc.autoTable({
      startY: 30,
      head: [['Name', 'Category', 'Qty', 'Price', 'Status', 'Purchased', 'Expiry', 'Notes']],
      body: filteredGroceries.map(item => [
        item.name,
        item.category,
        item.quantity,
        `LKR ${item.price.toFixed(2)}`,
        { content: item.status === 'Available' ? '✓ In Stock' : '✗ Out of Stock', styles: { fontStyle: 'bold' } },
        formatDate(item.purchasedDate),
        formatDate(item.expiryDate),
        item.notes || 'N/A'
      ]),
      theme: 'grid',
      styles: { 
        fontSize: 9,
        cellPadding: 1.5,
        lineColor: [44, 62, 80],
        lineWidth: 0.25
      },
      headStyles: {
        fillColor: [67, 97, 238],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 10,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 25, fontStyle: 'bold' },
        1: { cellWidth: 20 },
        2: { cellWidth: 12 },
        3: { cellWidth: 20 },
        4: { cellWidth: 40 },
        5: { cellWidth: 35 },
        6: { cellWidth: 20 },
        7: { cellWidth: 40 }
      },
      didDrawPage: (data) => {
        // Page number footer
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.text(
          `Page ${data.pageNumber} of ${pageCount}`,
          pageWidth - 20,
          doc.internal.pageSize.height - 5
        );
      }
    });

    doc.save(`groceries-report-${new Date().toISOString().slice(0,10)}.pdf`);
  };

  // Filtering logic
  const filteredGroceries = groceries.filter(grocery => {
    const matchesSearch = grocery.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (grocery.notes && grocery.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || grocery.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || grocery.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Helper functions
  const getCategoryEmoji = (category) => {
    const emojiMap = {
      'Dairy': '🥛', 'Produce': '🥦', 'Meat': '🥩', 'Bakery': '🍞',
      'Pantry': '🍚', 'Frozen': '❄️', 'Beverages': '🥤', 'Snacks': '🍿',
      'Household': '🏠', 'Other': '📦'
    };
    return emojiMap[category] || '📦';
  };

  if (loading) return <div className="text-center mt-4"><Spinner animation="border" /></div>;

  return (
    <div className="grocery-list-container">
      <div className="header-section">
        <h2>🍎 Grocery Inventory</h2>
        <Button as={Link} to="/add" className="add-button">
          <FiPlus className="button-icon" /> Add Item
        </Button>
      </div>

      <div className="filter-section">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <Form.Control
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <Dropdown 
            show={categoryDropdownOpen} 
            onToggle={(isOpen) => setCategoryDropdownOpen(isOpen)}
          >
            <Dropdown.Toggle className="filter-toggle">
              <FiFilter /> {selectedCategory}
            </Dropdown.Toggle>
            <Dropdown.Menu className="filter-menu">
              <Dropdown.Item onClick={() => {
                setSelectedCategory('All');
                setCategoryDropdownOpen(false);
              }}>
                🌈 All Categories
              </Dropdown.Item>
              {categories.map(category => (
                <Dropdown.Item 
                  key={category} 
                  onClick={() => {
                    setSelectedCategory(category);
                    setCategoryDropdownOpen(false);
                  }}
                >
                  {getCategoryEmoji(category)} {category}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>

          <Dropdown 
            show={statusDropdownOpen} 
            onToggle={(isOpen) => setStatusDropdownOpen(isOpen)}
          >
            <Dropdown.Toggle className="filter-toggle">
              <FiFilter /> {selectedStatus}
            </Dropdown.Toggle>
            <Dropdown.Menu className="filter-menu">
              <Dropdown.Item onClick={() => {
                setSelectedStatus('All');
                setStatusDropdownOpen(false);
              }}>
                🌟 All Statuses
              </Dropdown.Item>
              <Dropdown.Item onClick={() => {
                setSelectedStatus('Available');
                setStatusDropdownOpen(false);
              }}>
                ✅ Available
              </Dropdown.Item>
              <Dropdown.Item onClick={() => {
                setSelectedStatus('Out of Stock');
                setStatusDropdownOpen(false);
              }}>
                ⚠️ Out of Stock
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <Dropdown 
            show={exportDropdownOpen} 
            onToggle={(isOpen) => setExportDropdownOpen(isOpen)}
          >
            <Dropdown.Toggle className="export-button">
              <FiDownload /> Export
            </Dropdown.Toggle>
            <Dropdown.Menu className="filter-menu">
              <Dropdown.Item onClick={() => {
                generatePDFReport();
                setExportDropdownOpen(false);
              }}>
                📄 PDF Report
              </Dropdown.Item>
              <Dropdown.Item onClick={() => {
                generateCSVReport();
                setExportDropdownOpen(false);
              }}>
                📊 CSV Report
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>

      <div className="table-container">
        <Table hover responsive>
          <thead>
            <tr>
              <th>Item</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredGroceries.map((grocery) => (
              <tr key={grocery._id}>
                <td>
                  <span className="item-name">{grocery.name}</span>
                  {grocery.notes && <div className="item-notes">📝 {grocery.notes}</div>}
                </td>
                <td>
                  <span className="category-tag">
                    {getCategoryEmoji(grocery.category)} {grocery.category}
                  </span>
                </td>
                <td>
                  <div className="quantity-bubble">
                    {grocery.quantity}x
                  </div>
                </td>
                <td>
                  <div className="price-tag">
                    <span className="currency">LKR</span>
                    {grocery.price.toFixed(2)}
                  </div>
                </td>
                <td>
                  <div className={`status-pill ${grocery.status.toLowerCase().replace(' ', '-')}`}>
                    {grocery.status === 'Available' ? '✅ In Stock' : '⛔ Out of Stock'}
                  </div>
                </td>
                <td>
                  <div className="action-buttons">
                    <Button variant="link" as={Link} to={`/grocery/${grocery._id}`}>
                      <FiInfo className="action-icon info" />
                    </Button>
                    <Button variant="link" as={Link} to={`/edit/${grocery._id}`}>
                      <FiEdit className="action-icon edit" />
                    </Button>
                    <Button variant="link" onClick={() => deleteGrocery(grocery._id)}>
                      <FiTrash className="action-icon delete" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        
        {filteredGroceries.length === 0 && !loading && (
          <div className="empty-state">
            <div className="empty-illustration">🛒</div>
            <h3>No Items Found</h3>
            <p>Try adjusting your filters or add a new item!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroceryList;