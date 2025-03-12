// src/components/GroceryForm.js
import React, { useEffect, useState } from 'react';
import { Form, Button, Alert, Modal, Row, Col } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import './GroceryForm.css';

const GroceryForm = ({ edit }) => {
  // State declarations
  const [formData, setFormData] = useState({
    name: '',
    category: 'Other',
    quantity: 1,
    expiryDate: '',
    status: 'Available',
    price: 0,
    purchasedDate: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Hooks
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (edit && id) {
      fetchGrocery();
    }
  }, [edit, id]);

  const fetchGrocery = async () => {
    try {
      const response = await api.get(`/groceries/${id}`);
      setFormData({
        ...response.data,
        expiryDate: response.data.expiryDate ? response.data.expiryDate.split('T')[0] : '',
        purchasedDate: response.data.purchasedDate.split('T')[0]
      });
    } catch (error) {
      console.error('Error fetching grocery:', error);
      setError('Failed to load grocery data');
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (formData.quantity < 1) errors.quantity = 'Quantity must be at least 1';
    if (formData.price < 0) errors.price = 'Price cannot be negative';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setShowConfirm(true);
  };

  const confirmSubmission = async () => {
    setIsSubmitting(true);
    try {
      if (edit) {
        await api.put(`/groceries/${id}`, formData);
      } else {
        await api.post('/groceries', formData);
      }
      navigate('/');
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred during submission');
    } finally {
      setIsSubmitting(false);
      setShowConfirm(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePriceChange = (e) => {
    const value = Math.abs(parseFloat(e.target.value)) || 0;
    setFormData(prev => ({
      ...prev,
      price: value
    }));
  };

  return (
    <div className="form-container">
      <h2 className="form-title">{edit ? 'Edit Grocery Item' : 'Add New Grocery'}</h2>
      
      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

      <Form onSubmit={handleSubmit} className="grocery-form">
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3 form-group">
              <Form.Label>Name *</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                isInvalid={!!fieldErrors.name}
              />
              <Form.Control.Feedback type="invalid">
                {fieldErrors.name}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3 form-group">
              <Form.Label>Category</Form.Label>
              <Form.Select 
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="category-select"
              >
                <option value="Dairy">Dairy</option>
                <option value="Produce">Produce</option>
                <option value="Meat">Meat</option>
                <option value="Bakery">Bakery</option>
                <option value="Pantry">Pantry</option>
                <option value="Frozen">Frozen</option>
                <option value="Beverages">Beverages</option>
                <option value="Snacks">Snacks</option>
                <option value="Household">Household</option>
                <option value="Other">Other</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3 form-group">
              <Form.Label>Quantity *</Form.Label>
              <Form.Control
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
                isInvalid={!!fieldErrors.quantity}
              />
              <Form.Control.Feedback type="invalid">
                {fieldErrors.quantity}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3 form-group">
              <Form.Label>Price *</Form.Label>
              <div className="price-input">
                <span className="currency-symbol">$</span>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="price"
                  value={formData.price}
                  onChange={handlePriceChange}
                  min="0"
                  className="price-field"
                  isInvalid={!!fieldErrors.price}
                />
              </div>
              <Form.Control.Feedback type="invalid">
                {fieldErrors.price}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3 form-group">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Available">Available</option>
                <option value="Finished">Finished</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3 form-group">
              <Form.Label>Purchased Date</Form.Label>
              <Form.Control
                type="date"
                name="purchasedDate"
                value={formData.purchasedDate}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3 form-group">
          <Form.Label>Expiry Date</Form.Label>
          <Form.Control
            type="date"
            name="expiryDate"
            value={formData.expiryDate}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3 form-group">
          <Form.Label>Notes</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            maxLength={500}
          />
        </Form.Group>

        <div className="form-actions">
          <Button 
            variant="secondary" 
            className="cancel-btn"
            onClick={() => navigate('/')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            type="submit"
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : (edit ? 'Update' : 'Add')} Grocery
          </Button>
        </div>
      </Form>

      <ConfirmationModal 
        show={showConfirm}
        onHide={() => setShowConfirm(false)}
        onConfirm={confirmSubmission}
        isSubmitting={isSubmitting}
        edit={edit}
      />
    </div>
  );
};

const ConfirmationModal = ({ show, onHide, onConfirm, isSubmitting, edit }) => (
  <Modal show={show} onHide={onHide} centered>
    <Modal.Header closeButton>
      <Modal.Title>Confirm {edit ? 'Update' : 'Creation'}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      Are you sure you want to {edit ? 'update' : 'create'} this grocery item?
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={onHide} disabled={isSubmitting}>
        Cancel
      </Button>
      <Button variant="primary" onClick={onConfirm} disabled={isSubmitting}>
        {isSubmitting ? 'Processing...' : 'Confirm'}
      </Button>
    </Modal.Footer>
  </Modal>
);

export default GroceryForm;