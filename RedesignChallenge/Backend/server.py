from flask import Flask, jsonify, request
from process import (get_gene_list, get_gene_expression, get_kosara_data, get_UMI_totalCounts, get_tSNE_data, get_cell_cluster_UMI_tsne_df, get_up_regulated_L2FC_genes)
app = Flask(__name__)


@app.route('/geneList')
def get_geneList():
    page = request.args.get('page', default=1, type=int)
    per_page = request.args.get('per_page', default=55, type=int)
    gene_list = get_gene_list()
    start = (page - 1) * per_page
    end = start + per_page
    return jsonify(gene_list[start:end])

@app.route('/geneExpression', methods=['POST'])
def get_geneExpression():
    gene = request.json['gene']
    return jsonify(get_gene_expression(gene).to_dict())

@app.route('/getKosaraData')
def get_kosaraData():
    return jsonify(get_kosara_data().to_dict())

@app.route('/getUMITotalCounts')
def get_UMITotalCounts():
    return jsonify(get_UMI_totalCounts())

@app.route('/getCellClusterUMItsne')
def get_cellClusterUMItsne():
    return jsonify(get_cell_cluster_UMI_tsne_df().to_dict("records"))

@app.route('/getTSNEData')
def get_tSNEData():
    return jsonify(get_tSNE_data().to_dict())

@app.route('/getUpRegulatedL2FCGenesbyPage')
def get_upRegulatedL2FCGenes():
    page = request.args.get('page', default=1, type=int)
    per_page = request.args.get('per_page', default=15, type=int)
    data = get_up_regulated_L2FC_genes().to_dict("records")

    # Calculate start and end indexes
    start = (page - 1) * per_page
    end = start + per_page
    total = len(data)
    
    # Slice the data based on pagination
    paginated_data = data[start:end]

    return jsonify({
        'items': paginated_data,
        'total': total,
        'page': page,
        'per_page': per_page
    })

@app.route('/getUpRegulatedL2FCGenes')
def get_upRegulatedL2FCGenesWithoutPages():
    return jsonify(get_up_regulated_L2FC_genes().to_dict("records"))

if __name__ == '__main__':
    app.run(debug=True)
