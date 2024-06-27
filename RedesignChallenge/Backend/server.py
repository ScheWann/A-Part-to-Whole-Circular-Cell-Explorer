from flask import Flask, jsonify, request
from process import (get_gene_list)
app = Flask(__name__)


@app.route('/geneList')
def get_geneList():
    return jsonify(get_gene_list())


if __name__ == '__main__':
    app.run(debug=True)
