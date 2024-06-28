from flask import Flask, jsonify, request
from process import (get_gene_list, get_gene_expression, get_kosara_data)
app = Flask(__name__)


@app.route('/geneList')
def get_geneList():
    return jsonify(get_gene_list())

@app.route('/geneExpression', methods=['POST'])
def get_geneExpression():
    gene = request.json['gene']
    return jsonify(get_gene_expression(gene).to_dict())

@app.route('/getKosaraData')
def get_kosaraData():
    return jsonify(get_kosara_data().to_dict())

if __name__ == '__main__':
    app.run(debug=True)
