
import pandas as pd
import numpy as np
import json
from scipy import spatial


def generateDropdowns(input):

    f = open('dropdownDB.json',) 
    dropdownDB = json.load(f)

    out = {}
    i = 0

    for k, v in dropdownDB.items():
        if len(v[0].lower().split(input)) > 1:
            out[k] = v
            out[k][1] = i
            i += 1

        if i == 5: break

    return out

def generatePlotData(songId):

    f = open('plotData.json',) 
    db = json.load(f)

    songIndex = db['track_id'].index(songId)
    songCluster = db['cluster'][songIndex]

    db['cluster'] = [1 if i == songCluster else 0 for i in db['cluster']]
    db['cluster'][songIndex] += 1

    return db

def similarSongs(songId):

    f = open('similarityDb.json',) 
    db = json.load(f)

    cluster, target_vals = db[songId][2], db[songId][1]

    cos_vals, track_names, index, genres = [], [], [], {}

    for k, v in db.items():

        if v[2] == cluster:
            cos_vals.append(spatial.distance.cosine(target_vals, v[1]))
            track_names.append(v[0])
            index.append(k)

            for g in v[3]:
                if g not in genres:
                    genres[g] = 1
                else:
                    genres[g] += 1

    genres = {k: v for k, v in sorted(genres.items(), key=lambda item: item[1], reverse=True)}

    genresOut, i = {}, 0

    for k, v in genres.items():
        genresOut[i] = [k, v]
        i += 1

    cosDf = pd.DataFrame({
        'index': index,
        'track_names': track_names,
        'cos_vals': cos_vals
    }).sort_values(['cos_vals'], ascending=True)

    out = {
        'most': {},
        'least': {}
    }

    for i in range(1,6):
        out['most'][i-1] = list(cosDf.iloc[i,:])

    cosDf = cosDf.sort_values(['cos_vals'], ascending=False)

    for i in range(5):
        out['least'][i] = list(cosDf.iloc[i,:])

    return out, genresOut, cluster
