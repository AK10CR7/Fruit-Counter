import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fruitcounter';
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

// In-memory fruits (kept as before)
let fruits = [
  { id: 1, name: 'Cavendish Banana', price: 45, stock: 8 },
  { id: 2, name: 'Royal Gala Apple', price: 99, stock: 8 },
  { id: 3, name: 'Valencia Orange', price: 89, stock: 7 },
  { id: 4, name: 'Green Grapes', price: 129, stock: 5 },
  { id: 5, name: 'Alphonso', price: 149, stock: 3 },
  { id: 6, name: 'Strawberries', price: 199, stock: 0 }
];

// --- Mongoose setup ---
mongoose.set('strictQuery', false);
await mongoose.connect(MONGO_URI);
console.log('Successfully connected to MongoDB');

// User schema & model
const userSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// --- Helpers ---
function generateToken(user) {
  return jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
}
function sanitizeUser(user) {
  return { id: user._id, name: user.name, email: user.email, createdAt: user.createdAt };
}
async function findUserByEmail(email) {
  return await User.findOne({ email }).exec();
}

// --- Routes ---
app.get('/api/fruits', (req, res) => {
  res.json(fruits);
});

app.post('/api/register', async (req, res) => {
  try {
    const { name = '', email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

    const existing = await findUserByEmail(email);
    if (existing) return res.status(409).json({ error: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ name, email, passwordHash });
    await user.save();

    const token = generateToken(user);
    return res.status(201).json({ message: 'Registered successfully', token, user: sanitizeUser(user) });
  } catch (err) {
    console.error('Register error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

    const user = await findUserByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = generateToken(user);
    return res.json({ message: 'Login successful', token, user: sanitizeUser(user) });
  } catch (err) {
    console.error('Login error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Protected route to get current user
app.get('/api/me', async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: 'Unauthorized' });
    const token = auth.split(' ')[1];
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ user: sanitizeUser(user) });
  } catch (err) {
    console.error('Me error', err);
    return res.status(401).json({ error: 'Invalid token' });
  }
});

// Optional: simple endpoint to decrement stock when adding to cart (requires token)
app.post('/api/cart/add/:id', async (req, res) => {
  const id = Number(req.params.id);
  const fruit = fruits.find(f => f.id === id);
  if (!fruit) return res.status(404).json({ error: 'Fruit not found' });
  if (fruit.stock <= 0) return res.status(400).json({ error: 'Out of stock' });
  fruit.stock -= 1;
  return res.json({ message: 'Added to cart', fruit });
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});