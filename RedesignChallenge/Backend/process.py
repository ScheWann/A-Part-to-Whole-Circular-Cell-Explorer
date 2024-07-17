import pandas as pd
from scipy.io import mmread
from scipy import sparse
import numpy as np
import scanpy as sc
from scipy.optimize import fsolve
import h5py

# Load data
"""
geneList: list of genes
    ---attributes: 'gene', 'feature_type'

positions: list of Visium spot positions
    ---attributes: 'barcode', 'x', 'y', 'radius'

kosaraData: list of Visium spot each cell type percentage and occupied kosara arc angles
    ---attributes: 'barcode', 'x', 'y', 'radius', 'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'X8', 'X9', 'X1_angle', 'X2_angle', 'X3_angle', 'X4_angle', 'X5_angle', 'X6_angle', 'X7_angle', 'X8_angle', 'X9_angle'

adata: whole gene expression data(hdf5 file)

tSNE_df: t-SNE projection positions
    ---attributes: 'Barcode', 'X Coordinate', 'Y Coordinate'

tSNE_cluster_df: based on t-SNE projection, each cell's cluster
    ---attributes: 'Barcode', 'Graph-based'

expression_data: converted 'adata' to pandas dataframe
    ---attributes: rows are barcode, columns are gene name

cellTotal_df: each cell's total UMI counts
    ---attributes: 'barcode', 'total_counts'

up_regulated_L2FC_genes_df: list of up-regulated genes after L2FC analysis
    ---attributes: 'FeatureID', 'FeatureName', 'Cluster 1 Average', 'Cluster 1 Log2 Fold Change', 'Cluster 1 P-Value' ... 'Cluster 9 P-Value'
"""

geneList = pd.read_csv("../Data/Genes.csv")
positions = pd.read_csv("../Data/SpotPositions.csv")
kosaraData = pd.read_csv("../Data/kosaraChart.csv")
adata = sc.read_10x_h5("../Data/Filtered_feature_bc_matrix.h5")
tSNE_df = pd.read_csv("../Data/t-SNE_Projection.csv")
tSNE_cluster_df = pd.read_csv("../Data/t-SNE_Graph_Based.csv")
up_regulated_L2FC_genes_df = pd.read_csv("../Data/up_regulated_L2FC_genes.csv")

tSNE_df.rename(
    columns={"X Coordinate": "x", "Y Coordinate": "y", "Barcode": "barcode"},
    inplace=True,
)
tSNE_cluster_df.rename(
    columns={"Barcode": "barcode", "Graph-based": "cluster"}, inplace=True
)
up_regulated_L2FC_genes_df.rename(
    columns={
        "Cluster 1 Average": "cluster1Avg",
        "Cluster 1 Log2 Fold Change": "cluster1L2FC",
        "Cluster 1 P-Value": "cluster1PValue",
        "Cluster 2 Average": "cluster2Avg",
        "Cluster 2 Log2 Fold Change": "cluster2L2FC",
        "Cluster 2 P-Value": "cluster2PValue",
        "Cluster 3 Average": "cluster3Avg",
        "Cluster 3 Log2 Fold Change": "cluster3L2FC",
        "Cluster 3 P-Value": "cluster3PValue",
        "Cluster 4 Average": "cluster4Avg",
        "Cluster 4 Log2 Fold Change": "cluster4L2FC",
        "Cluster 4 P-Value": "cluster4PValue",
        "Cluster 5 Average": "cluster5Avg",
        "Cluster 5 Log2 Fold Change": "cluster5L2FC",
        "Cluster 5 P-Value": "cluster5PValue",
        "Cluster 6 Average": "cluster6Avg",
        "Cluster 6 Log2 Fold Change": "cluster6L2FC",
        "Cluster 6 P-Value": "cluster6PValue",
        "Cluster 7 Average": "cluster7Avg",
        "Cluster 7 Log2 Fold Change": "cluster7L2FC",
        "Cluster 7 P-Value": "cluster7PValue",
        "Cluster 8 Average": "cluster8Avg",
        "Cluster 8 Log2 Fold Change": "cluster8L2FC",
        "Cluster 8 P-Value": "cluster8PValue",
        "Cluster 9 Average": "cluster9Avg",
        "Cluster 9 Log2 Fold Change": "cluster9L2FC",
        "Cluster 9 P-Value": "cluster9PValue",
    },
    inplace=True,
)

# Convert feature matrix to dataframe
adata.var_names_make_unique()
expression_data = adata.to_df()

total_counts = expression_data.sum(axis=1)

# get total UMI counts for each cell
cellTotal_df = pd.DataFrame(
    {"barcode": total_counts.index, "total_counts": total_counts.values}
)
total_counts_dict = total_counts.to_dict()

cell_tsne_df = pd.merge(cellTotal_df, tSNE_df, on="barcode")
cell_cluster_UMI_tsne_df = pd.merge(cell_tsne_df, tSNE_cluster_df, on="barcode")


def get_gene_list():
    return list(geneList["gene"])


def get_gene_expression(gene):
    return expression_data[gene]


def get_kosara_data():
    return kosaraData


def get_UMI_totalCounts():
    return total_counts_dict


def get_tSNE_data():
    return cell_cluster_UMI_tsne_df


def get_cell_cluster_UMI_tsne_df():
    return tSNE_cluster_df


def get_up_regulated_L2FC_genes():
    return up_regulated_L2FC_genes_df
