from flask import Flask, jsonify, request
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# Banco de dados simulado em memória
produtos = [
    {"id": 1, "nome": "Notebook", "preco": 3500.00, "estoque": 10},
    {"id": 2, "nome": "Mouse", "preco": 50.00, "estoque": 50},
    {"id": 3, "nome": "Teclado", "preco": 150.00, "estoque": 30}
]

@app.route('/')
def home():
    return jsonify({
        "mensagem": "API de Produtos - CI/CD Demo",
        "versao": "1.0.0",
        "endpoints": ["/produtos", "/produtos/<id>", "/health"]
    })

@app.route('/health')
def health():
    return jsonify({"status": "healthy"}), 200

@app.route('/produtos', methods=['GET'])
def listar_produtos():
    return jsonify(produtos), 200

@app.route('/produtos/<int:produto_id>', methods=['GET'])
def obter_produto(produto_id):
    produto = next((p for p in produtos if p['id'] == produto_id), None)
    if produto:
        return jsonify(produto), 200
    return jsonify({"erro": "Produto não encontrado"}), 404

@app.route('/produtos', methods=['POST'])
def criar_produto():
    dados = request.get_json()
    
    if not dados or 'nome' not in dados or 'preco' not in dados:
        return jsonify({"erro": "Dados inválidos"}), 400
    
    novo_id = max([p['id'] for p in produtos]) + 1 if produtos else 1
    novo_produto = {
        "id": novo_id,
        "nome": dados['nome'],
        "preco": float(dados['preco']),
        "estoque": dados.get('estoque', 0)
    }
    produtos.append(novo_produto)
    return jsonify(novo_produto), 201

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)