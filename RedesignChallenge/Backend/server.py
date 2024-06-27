from flask import Flask, jsonify, request
from process import (get_gene_list, get_gene_expression)
app = Flask(__name__)


@app.route('/geneList')
def get_geneList():
    return jsonify(get_gene_list())

@app.route('/geneExpression', methods=['POST'])
def get_geneExpression():
    gene = request.json['gene']
    return jsonify(get_gene_expression(gene).to_dict())

if __name__ == '__main__':
    app.run(debug=True)
