from flask import Flask, render_template, url_for, request, redirect, session, make_response, jsonify

from datetime import datetime
import string
import time
import datetime
import os

from string import punctuation
from utils import generateDropdowns, generatePlotData, similarSongs

app = Flask(__name__)

@app.route('/', methods=['POST','GET'])
def index():
    return render_template('index.html')

@app.route('/searchDropdowns', methods=['POST'])
def submit():
    
    req = request.get_json()

    if req['input'] == '':
        return {'Empty string': ''}

    dropdowns = generateDropdowns(req['input'])

    return make_response(jsonify(dropdowns), 200)


@app.route('/fetchPlotData', methods=['POST'])
def plotData():
    
    req = request.get_json()

    if req['input'] == '':
        return {'Empty string': ''}

    print(req['input'])

    plotData = generatePlotData(req['input'])

    recs, genres, clusterNum = similarSongs(req['input'])

    clusterInfo = {
        'genres': genres,
        'clusterNum': clusterNum
    }

    out = {
        'response': plotData,
        'recs': recs,
        'clusterInfo': clusterInfo
    }

    return make_response(jsonify(out), 200)


app.secret_key = 'SECRET KEY'

if __name__ == "__main__":

    app.config['SESSION_TYPE'] = 'filesystem'
    app.run(debug=True,use_reloader=False)