import pandas as pd
from scipy.io import mmread
from scipy import sparse 
import numpy as np
from scipy.optimize import fsolve
import h5py


feature_matrix = mmread("../Data/FeatureMatrix.mtx")
geneList = pd.read_csv("../Data/Genes.csv")
positions = pd.read_csv('../Data/SpotPositions.csv')
kosaraData = pd.read_csv('../Data/kosaraChart.csv')

with h5py.File('../Data/Filtered_feature_bc_matrix.h5', 'r') as file:
    genes = [name.decode('utf-8') for name in file['matrix/features/name'][:]]
    barcodes = [barcode.decode('utf-8') for barcode in file['matrix/barcodes'][:]]
    
    data = file['matrix/data'][:]
    indices = file['matrix/indices'][:]
    indptr = file['matrix/indptr'][:]
    shape = file['matrix/shape'][:]

    matrix = sparse.csc_matrix((data, indices, indptr), shape=shape)

    expression_data = pd.DataFrame(matrix.toarray(), index=genes, columns=barcodes).transpose()
    expression_data.fillna(0, inplace=True)

# expression_data = pd.DataFrame(feature_matrix, index=positions['barcode'], columns=genes['gene'])
# expression_data.columns.name = None

def get_gene_list():
    return list(geneList['gene'])

def get_gene_expression(gene):
    return expression_data[gene]

def get_kosara_data():
    return kosaraData