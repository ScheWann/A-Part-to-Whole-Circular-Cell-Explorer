import pandas as pd
from scipy.io import mmread
import scipy.sparse
import numpy as np
from scipy.optimize import fsolve


feature_matrix = mmread("../Data/FeatureMatrix.mtx")
genes = pd.read_csv("../Data/Genes.csv")
positions = pd.read_csv('../Data/SpotPositions.csv')

expression_data = pd.DataFrame(feature_matrix, index=positions['barcode'], columns=genes['gene'])
expression_data.columns.name = None

def get_gene_list():
    return list(genes['gene'])