import React, { useState } from 'react';
import { Navbar, Button, Form, FormControl, Container, Row, Col } from 'react-bootstrap';

const Taskbar = ({ onStockAdd, totalPortfolio }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(`http://localhost:3001/search?q=${searchQuery}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer YOUR_JWT_TOKEN`, // Replace with your JWT token
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        console.log("received data from server:", data);
        setSearchResults(data);
      } else {
        console.error('Error fetching search results:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  };

  const handleLogout = () => {
    window.location.href = '/login'; 
  };

  const handleRefreshClick = () => {
    setSearchQuery(''); // Clear search field
  };

  const handleAddToDashboard = async () => {
    console.log("inside handleAddToDashboard");
    console.log("searchResults:", searchResults);
    try {
      const response = await fetch('http://localhost:3001/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          open: searchResults.open, 
          symbol: searchResults.symbol,
          company_name: searchResults.company_name,
          close: searchResults.close,
          high: searchResults.high,
          low: searchResults.low, 
          company_name: searchResults.company_name
        }),
      });
      if (response.ok) {
        onStockAdd(searchResults);
        alert('Stock added successfully');
      } else {
        alert('Failed to add stock');
      }
    } catch (error) {
      console.error('Error adding stock to dashboard:', error);
      alert('Error adding stock to dashboard');
    }
  };

  return (
    <Navbar style={{ backgroundColor: '#aba8b2', font: '#17301C'}} expand="lg" className="border-bottom">
      <Navbar.Collapse id="basic-navbar-nav">
        <Container fluid>
          <Row className="align-items-center">
            <Col lg="3">
              <Form onSubmit={handleSearchSubmit}>
                <FormControl 
                  type="text" 
                  placeholder="Ticker Symbol" 
                  value={searchQuery} 
                  onChange={handleSearchInputChange} 
                  className="w-100"
                />
              </Form>
            </Col>
            <Col lg="1" className="d-flex">
              <Button variant="outline-dark" type="submit" onClick={handleSearchSubmit}>Search</Button>
            </Col>
            <Col lg="4" className="text-center">
              {searchResults && (
                <div className="d-flex justify-content-around p-2 border border-dark align-items-center">
                  <h5 className="mb-0">{searchResults.symbol} opened at ${parseFloat(searchResults.open).toFixed(2)}.</h5>
                  <Button className='btn-secondary' onClick={handleAddToDashboard}>+</Button>
                </div>
              )}
            </Col>
            <Col lg="4" className="d-flex justify-content-between">
              <Button variant="outline-dark" className="mx-2" onClick={handleRefreshClick}>clear</Button>
              <Button variant="outline-dark" className="mx-2" onClick={handleLogout}>Logout</Button>
              <div style={{ border: '1px solid ', padding: '5px' }}>Total Portfolio: {isNaN(totalPortfolio) ? 0 : totalPortfolio}</div> 
            </Col>
          </Row>
        </Container>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default Taskbar;