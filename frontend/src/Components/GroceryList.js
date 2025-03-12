// src/components/GroceryList.js
import React, { useEffect, useState } from 'react';
import { Table, Button, Badge, Form, InputGroup, Dropdown, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { saveAs } from 'file-saver';
import api from '../services/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const GroceryList = () => {
  const [groceries, setGroceries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroceries();
    fetchCategories();
  }, []);

  const fetchGroceries = async () => {
    try {
      const response = await api.get('/groceries');
      setGroceries(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching groceries:', error);
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/groceries/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
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

  const generateCSVReport = () => {
    const headers = ['Name', 'Category', 'Quantity', 'Price', 'Status', 'Purchased Date', 'Expiry Date'];
    const csvContent = [
      headers.join(','),
      ...filteredGroceries.map(item => [
        `"${item.name}"`,
        item.category,
        item.quantity,
        item.price.toFixed(2),
        item.status,
        new Date(item.purchasedDate).toLocaleDateString(),
        item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `groceries-report-${new Date().toISOString().slice(0,10)}.csv`);
  };

  const generatePDFReport = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Name', 'Category', 'Quantity', 'Price', 'Status', 'Purchased Date', 'Expiry Date']],
      body: filteredGroceries.map(item => [
        item.name,
        item.category,
        item.quantity,
        `$${item.price.toFixed(2)}`,
        item.status,
        new Date(item.purchasedDate).toLocaleDateString(),
        item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'N/A'
      ]),
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] }
    });
    doc.save(`groceries-report-${new Date().toISOString().slice(0,10)}.pdf`);
  };

  const filteredGroceries = groceries.filter(grocery => {
    const matchesSearch = grocery.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (grocery.notes && grocery.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || grocery.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || grocery.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (loading) return <div className="text-center mt-4"><Spinner animation="border" /></div>;

  return (
    <div className="grocery-list-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Grocery List</h2>
        <Button as={Link} to="/create" variant="success">Add New</Button>
      </div>

      <div className="filter-controls mb-4">
        <InputGroup className="mb-3">
          <Form.Control
            placeholder="Search by name or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>

        <div className="d-flex gap-3">
          <Dropdown>
            <Dropdown.Toggle variant="outline-secondary">
              Category: {selectedCategory}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setSelectedCategory('All')}>All</Dropdown.Item>
              {categories.map(category => (
                <Dropdown.Item 
                  key={category} 
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>

          <Dropdown>
            <Dropdown.Toggle variant="outline-secondary">
              Status: {selectedStatus}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setSelectedStatus('All')}>All</Dropdown.Item>
              <Dropdown.Item onClick={() => setSelectedStatus('Available')}>Available</Dropdown.Item>
              <Dropdown.Item onClick={() => setSelectedStatus('Out of Stock')}>Out of Stock</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <Dropdown>
            <Dropdown.Toggle variant="primary">
              Generate Report
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={generatePDFReport}>PDF Report</Dropdown.Item>
              <Dropdown.Item onClick={generateCSVReport}>CSV Report</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>

      <Table striped bordered hover responsive className="shadow-sm">
        <thead className="table-dark">
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
          {filteredGroceries.map((grocery) => (
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
      {filteredGroceries.length === 0 && !loading && (
        <div className="text-center text-muted my-5">No groceries found matching your criteria</div>
      )}
    </div>
  );
};

export default GroceryList;