import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './LandingPage.css';
import LoadingScreen from './LoadingScreen';

const LandingPage = () => {
  const [shops, setShops] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredShops, setFilteredShops] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [showPhoneNumbers, setShowPhoneNumbers] = useState({});
  const [searchBy, setSearchBy] = useState('name'); // 'name' or 'location'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'open', or 'closed'
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    setIsAuthenticated(!!token);
    console.log('Current user:', user);

    // Simulate loading time
    setTimeout(() => {
      setIsLoading(false);
      // Add a small delay before showing content for smooth transition
      setTimeout(() => {
        setShowContent(true);
      }, 500);
    }, 2000);
  }, []);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await axios.get('https://vendoravailibitycheck-backend.onrender.com/api/shops');
        console.log('Fetched shops:', response.data);
        setShops(response.data);
      } catch (error) {
        console.error('Error fetching shops:', error);
      }
    };

    fetchShops();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  useEffect(() => {
    let filtered = [...shops];

    // Apply search term filter
    if (searchTerm) {
      filtered = filtered.filter(shop => {
        if (searchBy === 'name') {
          return shop.shopName.toLowerCase().includes(searchTerm.toLowerCase());
        } else {
          return shop.location.toLowerCase().includes(searchTerm.toLowerCase());
        }
      });
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(shop => 
        statusFilter === 'open' ? shop.isOpen : !shop.isOpen
      );
    }

    setFilteredShops(filtered);
  }, [searchTerm, shops, searchBy, statusFilter]);

  const togglePhoneNumber = (shopId) => {
    setShowPhoneNumbers(prev => ({
      ...prev,
      [shopId]: !prev[shopId]
    }));
  };

  const handleToggleStatus = async (shopId) => {
    try {
      const token = localStorage.getItem('token');
      const shop = shops.find(s => s._id === shopId);
      const newStatus = !shop.isOpen;
      
      await axios.patch(
        `https://vendoravailibitycheck-backend.onrender.com/api/shops/${shopId}/toggle-status`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setShops(prevShops =>
        prevShops.map(shop =>
          shop._id === shopId
            ? { ...shop, isOpen: newStatus }
            : shop
        )
      );
    } catch (error) {
      console.error('Error toggling shop status:', error);
    }
  };

  const isOwner = (shop) => {
    const user = JSON.parse(localStorage.getItem('user'));
    console.log('Checking ownership:', {
      shopOwnerId: shop.ownerId,
      currentUserId: user?.id,
      isMatch: user?.id === shop.ownerId
    });
    return user?.id === shop.ownerId;
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return 'https://via.placeholder.com/300x200?text=No+Image';
    return imageUrl.startsWith('http') ? imageUrl : `https://vendoravailibitycheck-backend.onrender.com${imageUrl}`;
  };

  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    
    // Reset authentication state
    setIsAuthenticated(false);
    
    // Clear any cached data
    setShops([]);
    setFilteredShops([]);
    
    // Redirect to home page
    navigate('/');
    
    // Force a page refresh to clear any cached state
    window.location.reload();
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className={`landing-page ${showContent ? 'content-visible' : ''}`}>
      <header className="header">
        <div className="header-left">
          <div className="logo-container">
            <img 
              src="https://res.cloudinary.com/diqqos08s/image/upload/v1743523532/Screenshot_21_o5te9p.png" 
              alt="Vendor Availability Logo"
              className="header-logo"
            />
          </div>
          <h1 className="header-title">Vendor Availability Check</h1>
        </div>
        <div className="header-right">
          <div className="auth-buttons">
            {isAuthenticated ? (
              <>
                <Link to="/add-shop" className="add-shop-btn">
                  Add Shop
                </Link>
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="login-btn">
                  Login
                </Link>
                <Link to="/register" className="register-btn">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="search-section">
        <div className="search-filters">
          <div className="filter-group">
            <label>Search By:</label>
            <select 
              value={searchBy} 
              onChange={(e) => setSearchBy(e.target.value)}
              className="filter-select"
            >
              <option value="name">Shop Name</option>
              <option value="location">Location</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Status:</label>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Shops</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
        <input
          type="text"
          placeholder={`Search shops by ${searchBy === 'name' ? 'name' : 'location'}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="shops-container">
        {filteredShops.map((shop) => {
          const isShopOwner = isOwner(shop);
          console.log('Shop:', shop.shopName, 'Is owner:', isShopOwner);
          return (
            <div key={shop._id} className="shop-card">
              <img 
                src={getImageUrl(shop.imageUrl)} 
                alt={shop.shopName} 
                className="shop-image"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x200?text=Error+Loading+Image';
                }}
              />
              <div className="shop-info">
                <h2>{shop.shopName}</h2>
                <p>Owner: {shop.ownerName}</p>
                <p>Location: {shop.location}</p>
                <div className="phone-number-section">
                  <button 
                    className="view-phone-btn"
                    onClick={() => togglePhoneNumber(shop._id)}
                  >
                    {showPhoneNumbers[shop._id] ? 'Hide Phone' : 'View Phone'}
                  </button>
                  {showPhoneNumbers[shop._id] && (
                    <p className="phone-number">Phone: {shop.phoneNumber}</p>
                  )}
                </div>
                <p className={`status ${shop.isOpen ? 'open' : 'closed'}`}>
                  {shop.isOpen ? 'Open' : 'Closed'}
                </p>
                {isAuthenticated && isShopOwner && (
                  <div className="shop-actions">
                    <Link to={`/edit-shop/${shop._id}`} className="edit-btn">
                      Edit Shop
                    </Link>
                    <button
                      className="toggle-status-btn"
                      onClick={() => handleToggleStatus(shop._id)}
                    >
                      {shop.isOpen ? 'Mark as Closed' : 'Mark as Open'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LandingPage; 