from flask import Flask, redirect, url_for, render_template, jsonify, request
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.decomposition import PCA
import matplotlib.pyplot as plt 

import pandas as pd
import numpy as np
import json
import random

from sklearn.cluster import KMeans

from scipy.spatial.distance import cdist, pdist
from sklearn.manifold import MDS
from sklearn.metrics import euclidean_distances
import sys


app = Flask(__name__)
data = pd.read_csv("data/HILS_SWLS_100_pp.csv")
data_original = data
data_unscaled = data.copy()

sampleSize = 500

projection_of_pca = []
pca_ind = dict({})
mode_pca = []
squared_loadings = []

best_columns = []

cluster_count = 3
sampSz = 50

mds =  MDS(n_components=2)
mds_fitted = None
mds_fitted_pc = None

def sort():
    global data
    data.sort_values(by='word_data.n',  ascending=False, inplace=True)
  

def preprocess():
    global data
        
    scaler = StandardScaler()
    scaled_features = scaler.fit_transform(data)
    data = pd.DataFrame(scaled_features, index=data.index, columns=data.columns)
    

def randomSampling():
    global sampleSize, data, data_unscaled
    data = data.sample(sampleSize, random_state=1)
    data.reset_index(inplace=True, drop=True)

    data_unscaled = data_unscaled.sample(sampleSize, random_state=1)
    data_unscaled.reset_index(inplace=True, drop=True)



def findClusterId():
    kmeanRes = KMeans(n_clusters=3, init='k-means++').fit(data)
    labels = kmeanRes.labels_
    # data['clusterNo'] = pd.Series(labels)

    
@app.route("/mds/euc", methods=["POST" , "GET"])
def get_mds_euc():
    global mds_fitted
    global mds
    global cluster_count
    global data


    if(request.method == 'POST'):
        cluster_count = int(request.get_json())
    # print("herhhhhhh")
    # print(cluster_count)
    if mds_fitted == None:
        mds_fitted = mds.fit(data)

    # print('mdsddd', mds_fitted.embedding_)
    #df_mds_euc =  pd.DataFrame(pd.DataFrame(mds_fitted.embedding_), columns=['x', 'y'])
    df_mds_euc = pd.DataFrame.from_records(mds_fitted.embedding_, columns=['x','y'])

    # print('mdsddd', df_mds_euc)
    kmeans = KMeans(n_clusters=cluster_count, random_state=0).fit(data)
    df_mds_euc['class'] = kmeans.labels_
    mds_data = df_mds_euc.to_dict(orient="records")
    # print(mds_data)
    return json.dumps(mds_data)


@app.route("/pcp", methods=["GET"])
def get_pcp():
    global mds_fitted_pc
    global data_unscaled

    # print('mdsddd', mds_fitted.embedding_)
    df_pcp = pd.DataFrame(data_unscaled)

    kmeans = KMeans(n_clusters=cluster_count, random_state=0).fit(data_unscaled)
    df_pcp['class'] = kmeans.labels_
 
    mds_data = df_pcp.to_dict(orient="records")
    # print(mds_dcata)
    return json.dumps(mds_data)



@app.route("/hils", methods=["POST" , "GET"])
def get_hils_data():
    global cluster_count, data_original, sampSz, data
    
    print(request.get_json())
    if(request.method == 'POST'):
        sampSz = int(request.get_json()['sampSz'])
        
        if 'clusterCnt' in request.get_json():
            cluster_count =  int(request.get_json()['clusterCnt'])
        

    top_attr_data = data[:sampSz]
    kmeans = KMeans(n_clusters=cluster_count, random_state=0)\
            .fit(top_attr_data[['word_data.dot.x', 'word_data.dot.y']])

    top_attr_data['class'] = kmeans.labels_

    tmp = top_attr_data.to_dict(orient="records")
    # print(data_original)
    return json.dumps(tmp)



@app.route("/data/all", methods=["GET"])
def get_hils_all():
    global cluster_count, sampSz, data

    tmp = data.to_dict(orient="records")
    # print(data_original)
    return json.dumps(tmp)


@app.route("/")
def home():
       
    print("pullll")
    global npca
    global cluster_count
    npca = 3

    cluster_count = 3
    return render_template("index.html")


if(__name__ == "__main__"):
    # preprocess() 
    sort()   
    app.config['TEMPLATES_AUTO_RELOAD'] = True
    app.run(port=8005, debug=True)
