import pandas as pd
from scipy.io import mmread
from scipy import sparse
import numpy as np
import scanpy as sc
from scipy.optimize import fsolve
import h5py

# Load data
feature_matrix = mmread("../Data/FeatureMatrix.mtx")
geneList = pd.read_csv("../Data/Genes.csv")
positions = pd.read_csv("../Data/SpotPositions.csv")
kosaraData = pd.read_csv("../Data/kosaraChart.csv")
adata = sc.read_10x_h5("../Data/Filtered_feature_bc_matrix.h5")

# Convert feature matrix to sparse matrix
adata.var_names_make_unique()
expression_data = adata.to_df()

# get total counts for each cell
total_counts = expression_data.sum(axis=1)
total_counts_dict = total_counts.to_dict()

def get_gene_list():
    return list(geneList["gene"])


def get_gene_expression(gene):
    return expression_data[gene]


def get_kosara_data():
    return kosaraData

def get_UMI_totalCounts():
    return total_counts_dict