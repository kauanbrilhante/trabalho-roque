const request = require('supertest');
const app = require('./server');

describe('Books API Tests', () => {
  
  // Teste do Health Check
  describe('GET /health', () => {
    it('should return health check status', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('ok');
      expect(response.body).toHaveProperty('message');
    });
  });

  // Testes de Listagem de Livros
  describe('GET /api/books', () => {
    it('should return all books', async () => {
      const response = await request(app).get('/api/books');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(0);
    });

    it('should return books with correct properties', async () => {
      const response = await request(app).get('/api/books');
      
      if (response.body.length > 0) {
        const book = response.body[0];
        expect(book).toHaveProperty('id');
        expect(book).toHaveProperty('title');
        expect(book).toHaveProperty('author');
        expect(book).toHaveProperty('status');
        expect(book).toHaveProperty('pages');
        expect(book).toHaveProperty('currentPage');
      }
    });
  });

  // Testes de Criação de Livros
  describe('POST /api/books', () => {
    it('should create a new book with all fields', async () => {
      const newBook = {
        title: 'Test Book',
        author: 'Test Author',
        pages: 300
      };

      const response = await request(app)
        .post('/api/books')
        .send(newBook);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(newBook.title);
      expect(response.body.author).toBe(newBook.author);
      expect(response.body.pages).toBe(newBook.pages);
      expect(response.body.status).toBe('pendente');
      expect(response.body.currentPage).toBe(0);
    });

    it('should create a new book without pages', async () => {
      const newBook = {
        title: 'Book Without Pages',
        author: 'Unknown Author'
      };

      const response = await request(app)
        .post('/api/books')
        .send(newBook);

      expect(response.status).toBe(201);
      expect(response.body.pages).toBe(0);
      expect(response.body.currentPage).toBe(0);
    });

    it('should return 400 if title is missing', async () => {
      const invalidBook = {
        author: 'Test Author',
        pages: 100
      };

      const response = await request(app)
        .post('/api/books')
        .send(invalidBook);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('obrigatórios');
    });

    it('should return 400 if author is missing', async () => {
      const invalidBook = {
        title: 'Test Book',
        pages: 100
      };

      const response = await request(app)
        .post('/api/books')
        .send(invalidBook);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('obrigatórios');
    });

    it('should return 400 if both title and author are missing', async () => {
      const invalidBook = {
        pages: 100
      };

      const response = await request(app)
        .post('/api/books')
        .send(invalidBook);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  // Testes de Busca por ID
  describe('GET /api/books/:id', () => {
    it('should return a specific book by ID', async () => {
      // Primeiro cria um livro
      const newBook = await request(app)
        .post('/api/books')
        .send({ title: 'Find Me', author: 'Test' });

      const bookId = newBook.body.id;

      // Depois busca por ID
      const response = await request(app).get(`/api/books/${bookId}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', bookId);
      expect(response.body.title).toBe('Find Me');
    });

    it('should return 404 for non-existent book', async () => {
      const response = await request(app).get('/api/books/99999');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('não encontrado');
    });
  });

  // Testes de Atualização
  describe('PUT /api/books/:id', () => {
    it('should update book status', async () => {
      // Cria um livro
      const newBook = await request(app)
        .post('/api/books')
        .send({ title: 'Update Status', author: 'Test' });

      const bookId = newBook.body.id;

      // Atualiza o status
      const response = await request(app)
        .put(`/api/books/${bookId}`)
        .send({ status: 'lendo' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('lendo');
    });

    it('should update book progress', async () => {
      // Cria um livro
      const newBook = await request(app)
        .post('/api/books')
        .send({ title: 'Update Progress', author: 'Test', pages: 200 });

      const bookId = newBook.body.id;

      // Atualiza o progresso
      const response = await request(app)
        .put(`/api/books/${bookId}`)
        .send({ currentPage: 50 });

      expect(response.status).toBe(200);
      expect(response.body.currentPage).toBe(50);
    });

    it('should update multiple fields at once', async () => {
      // Cria um livro
      const newBook = await request(app)
        .post('/api/books')
        .send({ title: 'Multiple Update', author: 'Test', pages: 300 });

      const bookId = newBook.body.id;

      // Atualiza vários campos
      const response = await request(app)
        .put(`/api/books/${bookId}`)
        .send({ 
          status: 'lendo', 
          currentPage: 100,
          title: 'Updated Title'
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('lendo');
      expect(response.body.currentPage).toBe(100);
      expect(response.body.title).toBe('Updated Title');
    });

    it('should return 404 for non-existent book', async () => {
      const response = await request(app)
        .put('/api/books/99999')
        .send({ status: 'lendo' });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  // Testes de Deleção
  describe('DELETE /api/books/:id', () => {
    it('should delete a book', async () => {
      // Cria um livro
      const newBook = await request(app)
        .post('/api/books')
        .send({ title: 'To Delete', author: 'Test' });

      const bookId = newBook.body.id;

      // Deleta o livro
      const deleteResponse = await request(app).delete(`/api/books/${bookId}`);
      expect(deleteResponse.status).toBe(204);

      // Verifica se foi deletado
      const checkResponse = await request(app).get(`/api/books/${bookId}`);
      expect(checkResponse.status).toBe(404);
    });

    it('should return 404 when deleting non-existent book', async () => {
      const response = await request(app).delete('/api/books/99999');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  // Teste de Integração Completo
  describe('Full Integration Test', () => {
    it('should handle complete book lifecycle', async () => {
      // 1. Criar livro
      const createResponse = await request(app)
        .post('/api/books')
        .send({ 
          title: 'Integration Test Book', 
          author: 'Integration Author',
          pages: 500
        });

      expect(createResponse.status).toBe(201);
      const bookId = createResponse.body.id;

      // 2. Buscar o livro criado
      const getResponse = await request(app).get(`/api/books/${bookId}`);
      expect(getResponse.status).toBe(200);
      expect(getResponse.body.title).toBe('Integration Test Book');

      // 3. Começar a ler
      const startReadingResponse = await request(app)
        .put(`/api/books/${bookId}`)
        .send({ status: 'lendo', currentPage: 100 });

      expect(startReadingResponse.status).toBe(200);
      expect(startReadingResponse.body.status).toBe('lendo');
      expect(startReadingResponse.body.currentPage).toBe(100);

      // 4. Atualizar progresso
      const updateProgressResponse = await request(app)
        .put(`/api/books/${bookId}`)
        .send({ currentPage: 300 });

      expect(updateProgressResponse.status).toBe(200);
      expect(updateProgressResponse.body.currentPage).toBe(300);

      // 5. Concluir leitura
      const completeResponse = await request(app)
        .put(`/api/books/${bookId}`)
        .send({ status: 'concluido', currentPage: 500 });

      expect(completeResponse.status).toBe(200);
      expect(completeResponse.body.status).toBe('concluido');

      // 6. Verificar na lista
      const listResponse = await request(app).get('/api/books');
      const foundBook = listResponse.body.find(b => b.id === bookId);
      expect(foundBook).toBeDefined();
      expect(foundBook.status).toBe('concluido');

      // 7. Deletar
      const deleteResponse = await request(app).delete(`/api/books/${bookId}`);
      expect(deleteResponse.status).toBe(204);

      // 8. Confirmar deleção
      const finalCheckResponse = await request(app).get(`/api/books/${bookId}`);
      expect(finalCheckResponse.status).toBe(404);
    });
  });

});