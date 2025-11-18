import express from 'express';
import cors from 'cors';
import path from 'path';

const app = express();

// Enable CORS
app.use(cors());
app.use(express.json());

// Serve static files (index.html)
app.use(express.static(path.join(__dirname, 'public')));

// In-memory fruits (kept as before)
let fruits = [
  { id: 1, name: 'Cavendish Banana', price: 45, stock: 8 },
  { id: 2, name: 'Royal Gala Apple', price: 99, stock: 8 },
  { id: 3, name: 'Valencia Orange', price: 89, stock: 7 },
  { id: 4, name: 'Green Grapes', price: 129, stock: 5 },
  { id: 5, name: 'Alphonso', price: 149, stock: 3 },
  { id: 6, name: 'Strawberries', price: 199, stock: 0 }
];

// Routes
// Get the list of fruits
app.get('/api/fruits', (req, res) => {
  res.json(fruits);
});

// Decrement stock when adding to cart
app.post('/api/cart/add/:id', (req, res) => {
  const id = Number(req.params.id);
  const fruit = fruits.find(f => f.id === id);
  if (!fruit) return res.status(404).json({ error: 'Fruit not found' });
  if (fruit.stock <= 0) return res.status(400).json({ error: 'Out of stock' });
  fruit.stock -= 1;
  return res.json({ message: 'Added to cart', fruit });
});

// Optional: endpoint to return full state (fruits + cart not persisted server-side)
app.get('/api/state', (req, res) => {
  res.json({ fruits });
});

// Serve the index.html on the root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404 handler for any other routes
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Port for server to listen on (use environment variable or fallback to 4000)
const PORT = process.env.PORT || 4000;

// Start the server
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

