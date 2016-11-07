//INITIALIZE TREE

//SET UP CANVAS ON WHICH WE WILL DRAW D3 TREE
var canvas = d3.select('.d3container').append('svg')
.style('overflow','scroll')
.attr('width', '100%')
.attr('height', '100%')
.append('g')
.attr('transform', 'translate(50,50)') //canvas covers entire page, first G starts at 50 50


//DEFINE VARIABLES THAT WILL GROUP LINKS AND NODES

var linkG = canvas.append('g')
var nodeG = canvas.append('g')


//DEFINE WIDTH AND HEIGHT ACCORDING TO CURRENT WINDOW SIZE

var width = window.innerWidth;
var height = window.innerHeight;


//DEFINE TREE

var tree = d3.layout.tree()
.size([height * .80, width * .65]) //height, width
.separation(function(a,b){return a.parent == b.parent ? 1 : 2})
// .size([800, 1000])


//DEFINE DIAGONAL LINES BETWEEN NODES

var diagonal = d3.svg.diagonal()
.projection(function(d){return [d.y,d.x]})


//FUNCTION TO TOGGLE TREE EXPANSION AND COMPRESSION

function toggleArtists(d) {
	if (d.children) {
		d._children = d.children; //TEMPORARILY STORE CHILDREN IN ._CHILDREN TO HIDE
		d.children = null;
	} else {
		d.children = d._children; //MOVE CHILDREN BACK INTO .CHILDREN TO SHOW
		d._children = null;
	}
}

//FUNCTION TO TOGGLE BETWEEN SONG PLAYING AND SONG PAUSE
//IN D.PLAY, STORE STATE OF EACH NODE AS PLAYING / NOT PLAYING
//STORE ARTIST NODE OF CURRENT SONG IN CURRENTSONGD
var currentSongD;
function toggleSound(d) {
	if (currentSongD && currentSongD !== d) currentSongD.play = false;
	if (d.play && d.play === true) {
		stopSong(d.id)
		d.play = false;
	} else {       
		d.play = true;
		playArtist(d.id)
		currentSongD = d;
	}
}


//FUNCTION TO UPDATE THE VISUAL TREE TO REFLECT NEW DATA AND ACTIONS

function updateD3Graph(artistTree, currentNode){
	
	var nodes = tree.nodes(artistTree); //PASS IN ARTIST TREE WITH UDPATED DATA TO REDEFINE NODES
	var links = tree.links(nodes); //REDEFINE LINKS BASED ON NEW NODES

	var node = nodeG.selectAll('.node') //DEFINE GROUP OF ALL NODES
		.data(nodes, function(d){return d.id})

    node.attr('transform', function(d){return 'translate(' + d.y + ',' + d.x + ')'}) //UPDATE SELECTION
		
    node.select('image.song') //UPDATE THE PLAY AND PAUSE ICONS
    	.attr('xlink:href', function(d){
	    	if (d.play === undefined || d.play === false) {
	    		d.play = false;
	    		return 'playimage.png'
	    	}
	    	else if (d.play === true) return 'pauseimage.png'
    	})
	
	var nodeEnter = node.enter() //DEFINE ENTER
            .append('g')
            .attr('class','node')
            .attr('id', function(d){return d.id})
            .attr('transform', function(d){return 'translate(' + d.y + ',' + d.x + ')'})


    nodeEnter.append('image') //ON ENTER, ADD ALBUM IMAGE TO THE NODE
        .attr('class','album')
        .attr('xlink:href', function(d){return d.data.image.url})
        .attr('x','-12px')
        .attr('y','-12px')
        .attr('width','40px')
        .attr('height','40px')
        .on('click', function(d){  //on clicking the album, there are 3 options:
        	if (d._children) { // 1. expand the data
        		toggleArtists(d)
        		updateD3Graph(artistTree, currentNode)
        		return;
        	}
        	if (d.children) { // 2. compress the data
        		toggleArtists(d)
        		updateD3Graph(artistTree, currentNode)
        		return;
        	}
        	else selectNextRelevantArtist(d.id, currentNode) // 3. fetch the data and expand
        })
        // .append('title').text(function(d){return d.data.name})


    nodeEnter.append('image') //ON ENTER, ADD PLAY-PAUSE ICON TO THE NODE
        .attr('class','song')
        .attr('xlink:href', 'playimage.png')
        .attr('x','-50px')
        .attr('y','-8px')
        .attr('width','35px')
        .attr('height','35px')
        .on('click', function(d){ //on clicking the icon, start playing song, or pause song
        	toggleSound(d);
        	updateD3Graph(artistTree, currentNode)
        })    


    nodeEnter.append('text') //ON ENTER, APPEND ARTIST NAME TO THE NODE
        .text((d)=>{ return d.data.name })
        .attr('x','30px')
        .attr('y','10px')
        .style('font-size', '22px')
        .on('click', function(d){  //on clicking the album, there are 3 options:
            if (d._children) { // 1. expand the data
                toggleArtists(d)
                updateD3Graph(artistTree, currentNode)
                return;
            }
            if (d.children) { // 2. compress the data
                toggleArtists(d)
                updateD3Graph(artistTree, currentNode)
                return;
            }
            else selectNextRelevantArtist(d.id, currentNode) // 3. fetch the data and expand
        })


    var link = linkG.selectAll('.link')
        .data(links, function(d){return d.source.id + '-' + d.target.id}) //CONNECT EXISTING TO NEW (LINKS VIA NODE ID)
        
    link.enter() //DEFINE LINK ENTER
	    .append('path')
	    .attr('class','link')
	    .attr('fill','none')
	    .attr('stroke','#ADADAD')

    link.attr('d', diagonal) //USE DIAGONAL FOR LINKS

    var nodeExit = node.exit() //DEFINE NODE EXIT
        .transition()
        .attr('transform', function(d){return 'translate(' + d.y + ',' + d.x + ')'})
        .remove()

    var linkExit = link.exit() //DEFINE LINK EXIT
        .transition()
        .attr('d', function(d){
        	var o = {x: d.source.x, y: d.source.y}
        	return diagonal({source: o, target: o})
        })
        .remove()

    nodes.forEach((d)=>{ //DEFINE SPACING
        d.y = d.depth * 90
    })

    nodes.forEach((d)=>{
       	d.x0 = d.x;
        d.y0 = d.y;
    })
}

