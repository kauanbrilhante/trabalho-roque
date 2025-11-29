const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Banco de dados em memória (para simplificar)
let books = [
  {
    id: 1,
    title: 'Clean Code',
    author: 'Robert C. Martin',
    status: 'lendo',
    pages: 464,
    currentPage: 120
  },
  {
    id: 2,
    title: 'O Programador Pragmático',
    author: 'Andrew Hunt',
    status: 'pendente',
    pages: 352,
    currentPage: 0
  }
];

let nextId = 3;

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API de Livros está funcionando!' });
});

// GET - Listar todos os livros
app.get('/api/books', (req, res) => {
  res.json(books);
});

// GET - Buscar livro por ID
app.get('/api/books/:id', (req, res) => {
  const book = books.find(b => b.id === parseInt(req.params.id));
  if (!book) {
    return res.status(404).json({ error: 'Livro não encontrado' });
  }
  res.json(book);
});

// POST - Adicionar novo livro
app.post('/api/books', (req, res) => {
  const { title, author, pages } = req.body;
  
  if (!title || !author) {
    return res.status(400).json({ error: 'Título e autor são obrigatórios' });
  }

  const newBook = {
    id: nextId++,
    title,
    author,
    status: 'pendente',
    pages: pages || 0,
    currentPage: 0
  };

  books.push(newBook);
  res.status(201).json(newBook);
});

// PUT - Atualizar livro
app.put('/api/books/:id', (req, res) => {
  const book = books.find(b => b.id === parseInt(req.params.id));
  
  if (!book) {
    return res.status(404).json({ error: 'Livro não encontrado' });
  }

  const { title, author, status, pages, currentPage } = req.body;
  
  if (title) book.title = title;
  if (author) book.author = author;
  if (status) book.status = status;
  if (pages !== undefined) book.pages = pages;
  if (currentPage !== undefined) book.currentPage = currentPage;

  res.json(book);
});

// DELETE - Remover livro
app.delete('/api/books/:id', (req, res) => {
  const index = books.findIndex(b => b.id === parseInt(req.params.id));
  
  if (index === -1) {
    return res.status(404).json({ error: 'Livro não encontrado' });
  }

  books.splice(index, 1);
  res.status(204).send();
});

// Rota principal - serve o HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📚 API de Livros disponível em http://localhost:${PORT}`);
});

module.exports = app;