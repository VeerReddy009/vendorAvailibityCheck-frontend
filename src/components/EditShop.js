import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './AddShop.css'; // We'll reuse the AddShop styles

const EditShop = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    ownerName: '',
    shopName: '',
    location: '',
    phoneNumber: '',
    isOpen: true
  });
  const [image, setImage] = useState(null);
  const [currentImage, setCurrentImage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShopDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please login to edit shop');
          navigate('/login');
          return;
        }

        const response = await axios.get(`https://vendoravailibitycheck-backend.onrender.com/api/shops/${id}`);
        const shop = response.data;
        
        setFormData({
          ownerName: shop.ownerName,
          shopName: shop.shopName,
          location: shop.location,
          phoneNumber: shop.phoneNumber,
          isOpen: shop.isOpen
        });
        setCurrentImage(shop.imageUrl);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching shop details:', error);
        setError('Error fetching shop details. Please try again.');
        setLoading(false);
      }
    };

    fetchShopDetails();
  }, [id, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to update shop');
        return;
      }

      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      if (image) {
        formDataToSend.append('image', image);
      }

      const response = await axios.put(
        `https://vendoravailibitycheck-backend.onrender.com/api/shops/${id}`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.status === 200) {
        navigate('/');
      }
    } catch (error) {
      console.error('Error updating shop:', error);
      setError(error.response?.data?.message || 'Error updating shop. Please try again.');
    }
  };

  if (loading) {
    return <div className="add-shop-container">Loading...</div>;
  }

  return (
    <div className="add-shop-container">
      <h2>Edit Shop</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="ownerName">Owner Name</label>
          <input
            type="text"
            id="ownerName"
            name="ownerName"
            value={formData.ownerName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="shopName">Shop Name</label>
          <input
            type="text"
            id="shopName"
            name="shopName"
            value={formData.shopName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="location">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="phoneNumber">Phone Number</label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="isOpen">Status</label>
          <select
            id="isOpen"
            name="isOpen"
            value={formData.isOpen}
            onChange={handleChange}
          >
            <option value="true">Open</option>
            <option value="false">Closed</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="image">Shop Image</label>
          {currentImage && (
            <div className="current-image">
              <img
                src={currentImage.startsWith('http') 
                  ? currentImage 
                  : `https://vendoravailibitycheck-backend.onrender.com${currentImage}`}
                alt="Current shop"
                style={{ maxWidth: '200px', marginBottom: '10px' }}
              />
              <p>Current image</p>
            </div>
          )}
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
          />
          <small>Leave empty to keep current image</small>
        </div>

        <div className="form-buttons">
          <button type="submit" className="submit-button">Update Shop</button>
          <button type="button" className="cancel-button" onClick={() => navigate('/')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditShop; 