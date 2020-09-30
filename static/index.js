
// main script

const dimensions = {
    'popularity': 0,
    'acousticness': 1,
    'danceability': 2,
    'duration_ms': 3,
    'energy': 4,
    'instrumentalness': 5,
    'liveness': 6,
    'loudness': 7,
    'speechiness': 8,
    'tempo': 9,
    'valence': 10,
    'pca_1': 11,
    'pca_2': 12,
    'pca_3': 13
};

var dimKeys = Object.keys(dimensions);

const XYZ = {
    0: 'x',
    1: 'y',
    2: 'z'
}

var slotStack = [];

$('#dropdowns').hide();
$('#dimensionsSelect').hide();
$('#recommendations').hide();
$('#padElement').hide();
$('#chartArea').hide();
$('#genreTags').hide();

var fetchedResponse;
var fetchedPlotData;
var fetchedRecommendations;
var fetchedClusterInfo;

for (key in dimensions){

    var node = document.createElement('p');

    node.style.margin = '3px';
    node.classList.add('dragDiv');

    node.innerHTML = key;
    node.id = 'dimButton:'+key;
    node.draggable = true;

    node.addEventListener('dragstart', function(event){
        event.srcElement.classList.add('dragging');
    });

    node.addEventListener('dragend', function(event){
        event.srcElement.classList.remove('dragging');

        // update slotStack by reading dimensionSlots' children
        var slotStack = [];

        var slotKids = document.getElementById('dimensionSlots').children;

        for (var i = 1; i < slotKids.length; i++){

            slotStack.push(slotKids[i].id.split(':')[1]);

        };

        $('#padElement').hide();

        if (slotStack.length == 1) {
            make1DPlot(fetchedPlotData[slotStack[0]], fetchedPlotData['cluster'], 'chartArea', slotStack);
        } else if (slotStack.length == 2) {
            make2DPlot(fetchedPlotData[slotStack[0]], fetchedPlotData[slotStack[1]], fetchedPlotData['cluster'], 'chartArea', slotStack);
        } else if (slotStack.length == 3) {
            make3DPlot(fetchedPlotData[slotStack[0]], fetchedPlotData[slotStack[1]], fetchedPlotData[slotStack[2]], fetchedPlotData['cluster'], 'chartArea', slotStack);
        } else if (slotStack.length == 0) {

            Plotly.purge('chartArea');

        };

    });

    document.getElementById('dimensionsSelectScroller').appendChild(node);

};


document.addEventListener('dragover', function(event){

    event.preventDefault();
    var draggable = document.querySelector('.dragging');

    const targetElement = event.srcElement;

    if ( targetElement.id == 'dimensionSlots' ) {

        if (document.getElementById('dimensionSlots').children.length < 4){
            targetElement.appendChild(draggable);
        };

        if (document.getElementById('dimensionSlots').children.length == 2){
            $('#padElement').show();
        };

    } else if ( targetElement.parentElement.id == 'dimensionSlots' ) {

        if (document.getElementById('dimensionSlots').children.length < 4){
            targetElement.parentElement.appendChild(draggable);
        };

        if (document.getElementById('dimensionSlots').children.length == 2){
            $('#padElement').show();
        };

    } else {

        var parent = document.getElementById('dimensionsSelectScroller');

        // #################### return draggable to scroller in correct position

        var elementName = draggable.id.split(':')[1];

        var keysToCheck = dimKeys.slice(dimensions[elementName]+1, dimKeys.length);

        var nameInsertBefore;
        var indexInsertBefore;

        for (var k = keysToCheck.length-1; k >= 0; k--){

            if ( document.getElementById('dimButton:'+keysToCheck[k]).parentElement.id == 'dimensionsSelectScroller' ){

                nameInsertBefore = keysToCheck[k];

            };

        };

        for (var i in parent.children){

            if ( parent.children[i].id == 'dimButton:'+nameInsertBefore ){

                indexInsertBefore = i;

            }

        };

        if (indexInsertBefore){

            parent.insertBefore(draggable, parent.children[indexInsertBefore]);

        } else {

            parent.appendChild(draggable);

        };

        // #################### backup option: just append to the end..
        // parent.appendChild(draggable);

        $('#padElement').hide();

    };

    $('#dragDropText').hide();
    if (document.getElementById('dimensionSlots').children.length <= 1){
        $('#dragDropText').show();
    }

});

document.getElementById('mainInputBar').addEventListener('input', function(event) {

    // document.getElementById('mainInputBar').value = document.getElementById('mainInputBar').value.replace(/[^a-zA-Z0-9 ]+/g, '').toLowerCase();
    document.getElementById('mainInputBar').value = document.getElementById('mainInputBar').value.toLowerCase();

    searchDropdowns(document.getElementById('mainInputBar').value);

});



function updateSong(event){

    document.getElementById('mainInputBar').value = '';

    for (var i = 0; i < 5; i++) {
        document.getElementById('dropdown:'+i).style.visibility = 'hidden';
    };
    $('#dropdowns').hide();
    $('#recommendations').hide();
    $('#dimensionsSelect').hide();
    $('#chartArea').hide();
    $('#genreTags').hide();

    Plotly.purge('chartArea');

    // POST REQUEST USING SONG ID

    fetchPlotData(event.srcElement.name, slotStack);

    document.getElementById('songName').innerHTML = event.srcElement.innerHTML;

    slotStack = [];
    
    let slotKids = [...document.getElementById('dimensionSlots').children];

    for (var i in slotKids) {

        console.log('checkpoint');

        if (slotKids[i].id != 'dragDropText' && slotKids[i].tagName){

            var tempEl = slotKids[i];

            document.getElementById('dimensionSlots').removeChild(tempEl);

            // append child in the right place in scroller

            var elementName = tempEl.id.split(':')[1];

            var keysToCheck = dimKeys.slice(dimensions[elementName]+1, dimKeys.length);
    
            var nameInsertBefore;
            var indexInsertBefore;

            var parent = document.getElementById('dimensionsSelectScroller');
    
            for (var k = keysToCheck.length-1; k >= 0; k--){
    
                if ( document.getElementById('dimButton:'+keysToCheck[k]).parentElement.id == 'dimensionsSelectScroller' ){
    
                    nameInsertBefore = keysToCheck[k];
    
                };
    
            };
    
            for (var i in parent.children){
    
                if ( parent.children[i].id == 'dimButton:'+nameInsertBefore ){
    
                    indexInsertBefore = i;
    
                }
    
            };
    
            if (indexInsertBefore){
    
                parent.insertBefore(tempEl, parent.children[indexInsertBefore]);
    
            } else {
    
                parent.appendChild(tempEl);
    
            };
        
        };

    };

    if (document.getElementById('dimensionSlots').children.length <= 1){
        $('#dragDropText').show();
    }

};

for (var i = 0; i < 5; i++) {

    document.getElementById('dropdown:'+i).addEventListener('click', function(event){

        updateSong(event);
        
    });

    document.getElementById('recommendation:most:'+i).addEventListener('click', function(event){
        updateSong(event);        
    });

};

function searchDropdowns(input) {

    var entry = {
        input: input
    }

    fetch(`${window.origin}/searchDropdowns`, {

        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(entry),
        cache: 'no-cache',
        headers: new Headers({
            'content-type': 'application/json'
        })

    }).then(function (response) {

        response.json().then(function(data){

            fetchedResponse = data;

            // element.style.visibility = 'hidden';      // Hide
            // element.style.visibility = 'visible';     // Show

            for (var i = 0; i < 5; i++) {
                document.getElementById('dropdown:'+i).style.visibility = 'hidden';
            };

            if ( input != '' && !jQuery.isEmptyObject(fetchedResponse) ){

                for (var key in fetchedResponse) {

                    var resultNum = fetchedResponse[key][1];
    
                    var btn = document.getElementById('dropdown:'+resultNum);
    
                    btn.innerHTML = fetchedResponse[key][0];
                    btn.name = key;

                    document.getElementById('dropdown:'+resultNum).style.visibility = 'visible';
    
                };

                $('#dropdowns').show();
    
            } else {

                $('#dropdowns').hide();

            };

        })

    });

};

function fetchPlotData(input, inputStack) {

    var entry = {
        input: input
    }

    fetch(`${window.origin}/fetchPlotData`, {

        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(entry),
        cache: 'no-cache',
        headers: new Headers({
            'content-type': 'application/json'
        })

    }).then(function (response) {

        response.json().then(function(data){

            fetchedPlotData = data['response'];
            fetchedRecommendations = data['recs'];
            fetchedClusterInfo = data['clusterInfo'];

            // POPULATE RECOMMENDATIONS, MAKE CLICKABLE

            $('#recommendations').show();
            $('#dimensionsSelect').show();
            $('#chartArea').show();
            $('#genreTags').show();

            for (var i = 0; i < 5; i++) {

                var ml = 'most';

                var songNameRec = fetchedRecommendations[ml][i][1];

                document.getElementById('recommendation:'+ml+':'+i).innerHTML = songNameRec;
                document.getElementById('recommendation:'+ml+':'+i).name = fetchedRecommendations[ml][i][0];

            };

            // POPULATE CLUSTER INFO

            document.getElementById('clusterNum').innerHTML = `Cluster ${fetchedClusterInfo['clusterNum']}`;

            var clusterGenres = fetchedClusterInfo['genres'];

            var sumGenres = 0;

            for (var i = 0; i < Object.keys(clusterGenres).length; i++){
                sumGenres = sumGenres + clusterGenres[i][1];
            };

            if (sumGenres > 0){
                for (var i = 0; i < 3; i++){
                    clusterName = clusterGenres[i][0];
                    clusterPct = clusterGenres[i][1] / sumGenres;

                    $(`#genre${i+1}`).hide();

                    if ( clusterPct > 0.05 ) {

                        document.getElementById(`genre${i+1}`).innerHTML = `${clusterName} ${Math.round(clusterPct*100)}%`
                        $(`#genre${i+1}`).show();

                    }

                };
            };

        });

    });

};

const divNames = ['.buttonDiv', '.recDiv', '.dragDiv']

for (var i in divNames) {

    $(divNames[i]).hover(
        function () {							
    
            $(this).animate({
                backgroundColor: "rgb(60, 60, 60)"
            }, 100 );
        },
        function () {
    
            $(this).animate({
                backgroundColor: "rgb(40, 40, 40)"
            }, 100 );
    
        }
    );
    
};


// #######################    plots    ##################################

const plotMargin = 30;
const plotMargin3D = 0;

const plotWidth = 430;
const plotHeight = 400;

const plotColor = 'rgb(20, 20, 20)';

const colorMain = '#00FF66';
const colorSupporting = '#FF0033';

function make1DPlot(array1, clusterAr, targetDiv, slotStack){

    var arrayX_targetCluster = [];
    var arrayX_otherCluster = [];

    for (var i = 0; i < array1.length; i++){

        if (clusterAr[i] == 0){

            arrayX_otherCluster.push(array1[i]);

        } else if (clusterAr[i] == 1) {

            arrayX_targetCluster.push(array1[i]);

        };

        if (clusterAr[i] == 2) {

            Xtarget = array1[i];
            
        };

    };

    var trace1 = {
        x: arrayX_targetCluster,
        type: "histogram",
        histnorm: 'probability',
        opacity: 0.7,
        marker: {
            color: colorMain,
        }, 
        xbins: { 
            end: 4, 
            size: 1/25, 
            start: -3.2  
        },
        name: `Cluster ${fetchedClusterInfo['clusterNum']}`
    };
    
    var trace2 = {
        x: arrayX_otherCluster,
        type: "histogram",
        histnorm: 'probability',
        opacity: 0.4,
        marker: {
            color: colorSupporting,
        }, 
        xbins: { 
            end: 4, 
            size: 1/25, 
            start: -3.2  
        },
        name: 'Other songs'
    };
      
    var plotData = [trace1, trace2];

    var layout = {
        barmode: "overlay",
        width: plotWidth,
        height: plotHeight,
        margin: {
            l: plotMargin,
            r: plotMargin,
            b: plotMargin,
            t: plotMargin
        },
        shapes: [{
          type: 'line',
          x0: Xtarget,
          y0: 0,
          x1: Xtarget,
          y1: 1,
          yref: 'paper',
          line: {
            color: 'black',
            width: 2,
            dash: 'dot'
          }
        }],
        // title: {
        //     text:'Plot Title',
        // },
        xaxis: {
            title: {
                text: slotStack[0],
            },
        },
        plot_bgcolor: plotColor,
        paper_bgcolor: plotColor
    };
    Plotly.newPlot(targetDiv, plotData, layout);

};


function make2DPlot(array1, array2, clusterAr, targetDiv, slotStack){

    var arrayX_targetCluster = [];
    var arrayX_otherCluster = [];
    var arrayY_targetCluster = [];
    var arrayY_otherCluster = [];

    for (var i = 0; i < array1.length; i++){

        if (i % 10 == 0) {

            if (clusterAr[i] == 0){

                arrayX_otherCluster.push(array1[i]);
                arrayY_otherCluster.push(array2[i]);

            } else if (clusterAr[i] == 1) {

                arrayX_targetCluster.push(array1[i]);
                arrayY_targetCluster.push(array2[i]);

            };

        };

        if (clusterAr[i] == 2) {

            Xtarget = array1[i];
            Ytarget = array2[i];

        };

    };
    
    var trace1 = {
        x: arrayX_otherCluster,
        y: arrayY_otherCluster,
        mode: 'markers',
        type: 'scatter',
        marker: {
            size: 20,
            color: colorSupporting,
            opacity: 0.1
        },
        name: 'Other songs'
    };
    var trace2 = {
        x: arrayX_targetCluster,
        y: arrayY_targetCluster,
        mode: 'markers',
        type: 'scatter',
        marker: {
            size: 20,
            color: colorMain,
            opacity: 0.5
        },
        name: `Cluster ${fetchedClusterInfo['clusterNum']}`
    };
    var trace3 = {
        x: [Xtarget],
        y: [Ytarget],
        mode: 'markers',
        type: 'scatter',
        marker: {
            size: 20,
            color: 'black',
            opacity: 0.9
        },
        name: 'Selected song' 
    };

    // var trace4 = {
    //     x: arrayX_otherCluster,
    //     y: arrayY_otherCluster,
    //     name: 'density',
    //     ncontours: 20,
    //     colorscale: 'Hot',
    //     // reversescale: true,
    //     // showscale: false,
    //     type: 'histogram2dcontour'
    // };

    var layout = {
        // title: {
        //     text:'Plot Title',
        // },
        width: plotWidth,
        height: plotHeight,
        margin: {
            l: plotMargin,
            r: plotMargin,
            b: plotMargin,
            t: plotMargin
        },
        xaxis: {
            title: {
                text: slotStack[0],
            },
        },
        yaxis: {
            title: {
                text: slotStack[1],
            },
        },
        shapes: [{
            type: 'line',
            x0: Xtarget,
            y0: 0,
            x1: Xtarget,
            y1: 1,
            // yref: 'paper',
            // xref: 'paper',
            line: {
                color: 'black',
                width: 2,
                dash: 'dot'
            }
        },
        {
            type: 'line',
            x0: 0,
            y0: Ytarget,
            x1: 1,
            y1: Ytarget,
            // yref: 'paper',
            // xref: 'paper',
            line: {
                color: 'black',
                width: 2,
                dash: 'dot'
            }
        }],
        plot_bgcolor: plotColor,
        paper_bgcolor: plotColor
    };
      
    var plotData = [trace1, trace2, trace3];
    Plotly.newPlot(targetDiv, plotData, layout);

};

function make3DPlot(array1, array2, array3, clusterAr, targetDiv, slotStack){

    var arrayX_targetCluster = [];
    var arrayX_otherCluster = [];
    var arrayY_targetCluster = [];
    var arrayY_otherCluster = [];
    var arrayZ_targetCluster = [];
    var arrayZ_otherCluster = [];

    for (var i = 0; i < array1.length; i++){

        if (i % 10 == 0) {

            if (clusterAr[i] == 0){

                arrayX_otherCluster.push(array1[i]);
                arrayY_otherCluster.push(array2[i]);
                arrayZ_otherCluster.push(array3[i]);

            } else if (clusterAr[i] == 1) {

                arrayX_targetCluster.push(array1[i]);
                arrayY_targetCluster.push(array2[i]);
                arrayZ_targetCluster.push(array3[i]);

            };

        };

        if (clusterAr[i] == 2) {

            Xtarget = array1[i];
            Ytarget = array2[i];
            Ztarget = array3[i];

        };

    };
 
    var trace1 = {
        x: arrayX_otherCluster, 
        y: arrayY_otherCluster, 
        z: arrayZ_otherCluster,
        mode: 'markers',
        marker: {
            size: 12,
            line: {
                color: colorSupporting,                
                width: 0
            },
            color: colorSupporting,
            opacity: 0.1
        },
        type: 'scatter3d',
        name: 'Other songs'
    };

    var trace2 = {
        x: arrayX_targetCluster, 
        y: arrayY_targetCluster, 
        z: arrayZ_targetCluster,
        mode: 'markers',
        marker: {
            size: 12,
            line: {
                color: colorMain,
                width: 0
            },
            color: colorMain,
            opacity: 0.5
        },
        type: 'scatter3d',
        name: `Cluster ${fetchedClusterInfo['clusterNum']}`
    };

    var trace3 = {
        x: [Xtarget], 
        y: [Ytarget], 
        z: [Ztarget],
        mode: 'markers',
        marker: {
            size: 12,
            line: {
                color: 'black',
                width: 0
            },
            color: 'black',
            opacity: 0.9
        },
        type: 'scatter3d',
        name: 'Selected song'
    };

    var plotData3 = [trace1, trace2, trace3];

    var layout = {
        width: plotWidth,
        height: plotHeight,
        margin: {
            l: plotMargin3D,
            r: plotMargin3D,
            b: plotMargin3D,
            t: plotMargin3D
        },
        scene: {
            xaxis:{title: slotStack[0]},
            yaxis:{title: slotStack[1]},
            zaxis:{title: slotStack[2]}
        },
        plot_bgcolor: plotColor,
        paper_bgcolor: plotColor
    };

    Plotly.newPlot(targetDiv, plotData3, layout);

};
