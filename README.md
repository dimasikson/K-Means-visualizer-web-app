# K-Means-visualizer-web-app

### Link: https://k-means-visualizer-web-app.herokuapp.com/

# 1. What is this project?

This project is visualization tool for a popular unsupervised machine learning algorithm, K-Means clustering.

This project uses Spotify song data to group songs into clusters by similarity. You can select a song and visualize distributions of each parameter in up to 3 dimensions of the cluster it belongs to as well as other songs.

![](https://i.gyazo.com/3bff54b1a9bb76d3520ff0fd8b935bed.png)

#### Chart 1. Demo of the main charting tool, showing the distribution of three song parameters for the song Imagine by John Lennon (loudness, energy and danceability). The song belongs to Cluster 12, in green.

You can also navigate songs in the Recommendations section, which selects most similar songs to the one you chose using Cosine Similarity.

![](https://i.gyazo.com/4e38ea82b12a28638cfaf8840f5dfe5c.png)

#### Chart 2. Demo of the recommendations section, showing top 5 most similar songs to Imagine by John Lennon.

# 2. How was it done?

## 2.1 K-Means clustering

We use Spotify song data to cluster songs offline using 14 parameters that can be seen in the above screenshot. We then store the results in a JSON to later retrieve.

![](https://www.saedsayad.com/images/Clustering_kmeans_c.png)

#### Chart 3. High level overview of the main objective function of K-Means, which is to minimize the squared error between observations and the cluster centroid. Source: https://www.saedsayad.com/clustering_kmeans.htm

#### More on the parameters can be found here: https://developer.spotify.com/documentation/web-api/reference/tracks/get-audio-features/
#### Data source: https://www.kaggle.com/zaheenhamidani/ultimate-spotify-tracks-db

## 2.2 Song recommendations

To recommend songs we have to rank them by similarity to the target song. We first limit the candidate pool to only the songs in the same cluster, then rank them by the below formula.

![](https://neo4j.com/docs/graph-algorithms/current/images/cosine-similarity.png)

#### Chart 4. The formula for computing Cosine Similarity between two N-dimensional vectors A and B (in our case A is the target song and B are other songs). Source: https://neo4j.com/docs/graph-algorithms/current/labs-algorithms/similarity/

## 2.3 Web app

The web app is built using vanilla JS with a Flask backend, deployed on Heroku. Charts built using the Plotly.js library. K-Means model was done offline.

### Thank you for reading!
