import React, { useState } from 'react';
import { Navbar, Button, Form, FormControl, Container, Row, Col } from 'react-bootstrap';

const Taskbar = ({ searchResults, setSearchResults }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Event handler for handling changes in the search input
  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Event handler for handling search submission
  const handleSearchSubmit = async (event) => {
    event.preventDefault();
    console.log("handSearchSubmit ran");
    try {
      // Make API request using search query
      const response = await fetch(`http://localhost:3001/search?q=${searchQuery}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer YOUR_JWT_TOKEN`, // Replace with your JWT token
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        console.log("response ok")
        console.log(response);
        const data = await response.json();
        // Update search results state with API response data
        setSearchResults(data);
      } else {
        console.error('Error fetching search results:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  };

  return (
    <Navbar bg="light" expand="lg" className="border-bottom">
      <Navbar.Collapse id="basic-navbar-nav">
        <Container>
          <Row className="align-items-center">
            {/* Search Form */}
            <Col xs={2}>
              <Form onSubmit={handleSearchSubmit}>
                <FormControl 
                  type="text" 
                  placeholder="Search" 
                  value={searchQuery} 
                  onChange={handleSearchInputChange} 
                  className="w-100" // width of the search field
                />
                <Button variant="outline-primary" type="submit">Search</Button>
              </Form>
            </Col>
            {/* Buttons for other functionalities */}
            <Col xs={3} className="d-flex justify-content-end">
              <Button variant="outline-success" className="mr-2">Home</Button>
              <Button variant="outline-success" className="mr-2">Refresh</Button>
              <Button variant="outline-danger" className="mr-2">Logout</Button>
              <div style={{ border: '1px solid red', padding: '5px' }}>Total Portfolio: $1000</div>
            </Col>
          </Row>
        </Container>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default Taskbar;
