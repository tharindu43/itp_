import { Container } from 'react-bootstrap';
import { Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import GroceryList from './components/GroceryList';
import GroceryForm from './components/GroceryForm';
import GroceryDetails from './components/GroceryDetails';

function App() {
  return (
    <>
      <Navigation />
      <Container className="mt-4">
        <Routes>
          <Route path="/" element={<GroceryList />} />
          <Route path="/add" element={<GroceryForm />} />
          <Route path="/grocery/:id" element={<GroceryDetails />} />
          <Route path="/edit/:id" element={<GroceryForm edit />} />
        </Routes>
      </Container>
    </>
  );
}

export default App;