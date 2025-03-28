// src/components/GroceryForm.js
import React, { useEffect, useState } from 'react';
import { Form, Button, Alert, Modal, Row, Col } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import './GroceryForm.css';

const GroceryForm = ({ edit }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Other',
    quantity: 1,
    expiryDate: '',
    status: 'Available',
    price: '',
    purchasedDate: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (edit && id) {
      fetchGrocery();
    }
  }, [edit, id]);

  const getTodayLocal = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
  };

  const fetchGrocery = async () => {
    try {
      const response = await api.get(`/groceries/${id}`);
      setFormData({
        ...response.data,
        price: response.data.price.toFixed(2),
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
    const today = getTodayLocal();

    if (!formData.name.trim()) errors.name = 'Name is required';

    const quantity = parseFloat(formData.quantity);
    if (isNaN(quantity)) {
      errors.quantity = 'Quantity must be a number';
    } else if (quantity < 1) {
      errors.quantity = 'Must be at least 1';
    } else if (!Number.isInteger(quantity)) {
      errors.quantity = 'Must be a whole number';
    }

    const priceValue = parseFloat(formData.price);
    if (formData.price.trim() === '') {
      errors.price = 'Price is required';
    } else if (isNaN(priceValue)) {
      errors.price = 'Invalid price format';
    } else if (priceValue <= 0) {
      errors.price = 'Must be greater than 0';
    }

    if (formData.purchasedDate > today) {
      errors.purchasedDate = 'Cannot be in future';
    }
    
    if (formData.expiryDate) {
      const expiry = new Date(formData.expiryDate);
      const purchased = new Date(formData.purchasedDate);
      if (expiry < purchased) {
        errors.expiryDate = 'Must be after purchase date';
      }
    }

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
      const submissionData = {
        ...formData,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity)
      };

      if (edit) {
        await api.put(`/groceries/${id}`, submissionData);
      } else {
        await api.post('/groceries', submissionData);
      }
      navigate('/');
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred during submission');
    } finally {
      setIsSubmitting(false);
      setShowConfirm(false);
    }
  };

// Add this state at the component level
const [errors, setErrors] = useState({});

const handleChange = (e) => {
  const { name, value } = e.target;
  
  if (name === "name") {
    const nameRegex = /^[A-Za-z\s'-]*$/;
    const isValid = nameRegex.test(value);
    
    if (isValid) {
      setFormData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, name: "" }));
    } else {
      setErrors((prev) => ({ ...prev, name: "No numbers or special characters allowed" }));
    }
  } else {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }
};

  const handlePriceChange = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setFormData(prev => ({
        ...prev,
        price: value
      }));
    }
  };

  const handlePriceBlur = () => {
    if (formData.price) {
      const formattedPrice = parseFloat(formData.price).toFixed(2);
      setFormData(prev => ({
        ...prev,
        price: formattedPrice
      }));
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title">{edit ? 'Edit Grocery Item' : 'Add New Grocery'}</h2>
      
      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

      <Form onSubmit={handleSubmit} className="grocery-form" noValidate>
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
                required
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
                step="1"
                isInvalid={!!fieldErrors.quantity}
                required
                aria-describedby="quantityHelp"
              />
              <Form.Text id="quantityHelp" muted>
              
              </Form.Text>
              <Form.Control.Feedback type="invalid">
                {fieldErrors.quantity}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3 form-group">
              <Form.Label>Price *</Form.Label>
              <div className="price-input">
                <span className="currency-symbol">LKR</span>
                <Form.Control
                  type="text"
                  name="price"
                  value={formData.price}
                  onChange={handlePriceChange}
                  onBlur={handlePriceBlur}
                  className="price-field"
                  isInvalid={!!fieldErrors.price}
                  required
                  aria-describedby="priceHelp"
                  placeholder="0.00"
                />
              </div>
              <Form.Text id="priceHelp" muted>
               
              </Form.Text>
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
                max={getTodayLocal()}
                isInvalid={!!fieldErrors.purchasedDate}
              />
              <Form.Control.Feedback type="invalid">
                {fieldErrors.purchasedDate}
              </Form.Control.Feedback>
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
            isInvalid={!!fieldErrors.expiryDate}
            min={formData.purchasedDate}
            aria-describedby="expiryHelp"
          />
          <Form.Text id="expiryHelp" muted>
           
          </Form.Text>
          <Form.Control.Feedback type="invalid">
            {fieldErrors.expiryDate}
          </Form.Control.Feedback>
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
            aria-describedby="notesHelp"
          />
          <Form.Text id="notesHelp" muted className="d-flex justify-content-between">
           <br /> <span>Additional information (optional)</span>
            <span>{500 - formData.notes.length} characters remaining</span>
          </Form.Text>
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