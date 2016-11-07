var artistTree = {};
var currentNode = artistTree;
var pastArtists = [];


//GET DATA FROM FORM FOR INITIAL ARTIST
document.getElementById('search-form').addEventListener('submit', function (e) {
    e.preventDefault();
    searchArtists(document.getElementById('query').value);
}, false);


//FETCH INITIAL ARTIST AND FIND SIMILAR ARTISTS
var searchArtists = function (query) {
    $.ajax({
        //CALL API TO FIND ARTIST BASED ON USER QUERY
        url: 'https://api.spotify.com/v1/search',
        data: {
            q: query,
            type: 'artist'
        },
        success: function (response) {
            var firstArtist = response.artists.items[0]
            artistTree = {
                id: firstArtist.id,
                children: [],
                data: {
                    name: firstArtist.name,
                    image: firstArtist.images[0],
                    uri: firstArtist.uri
                }
            }
        pastArtists.push(firstArtist.id)
        //CALL RELEVANT ARTISTS FUNCTION ON FIRST ARTIST
        fetchRelevantArtists(artistTree.id, artistTree)
        }
    });
};

//SELECT NEXT RELEVANT ARTISTS FROM TREE
var selectNextRelevantArtist = function(artistId, currentNode){
    var newCurrentIndex = _.findIndex(currentNode.children, {id: artistId})
    currentNode = currentNode.children[newCurrentIndex]
    //CALL RELEVANT ARTISTS FUNCTION ON THE SELECTED ARTIST
    fetchRelevantArtists(artistId, currentNode)
}

//FETCH RELEVANT ARTISTS FROM SPOTIFY
var fetchRelevantArtists = function(artistId, currentNode){
    $.ajax({
        //CALL API TO FIND RELEVANT ARTISTS BASED ON ARTIST ID
        url: 'https://api.spotify.com/v1/artists/'+artistId+'/related-artists',
        success: function (response) {
            //ADD THE FIRST 5 SIMILAR ARTISTS, EXCLUDING ONES ALREADY ON THE TREE (STORED IN pastArtists ARRAY)
            var newArtists = response.artists.filter((artist)=>{return pastArtists.indexOf(artist.id) === -1})
            newArtists.slice(0,5).forEach((artist)=>{
                object = {
                    id: artist.id,                    
                    children: [],
                    data: {
                        name: artist.name,
                        image: artist.images[0],
                        uri: artist.uri
                    }   
                }
                pastArtists.push(artist.id)
                if (currentNode['children']) currentNode['children'].push(object)
                else currentNode['children'] = [object]
            })
            console.log('updated artistTree', artistTree)
            //UPDATE VISUALIZATION BASED ON NEW DATA
            updateD3Graph(artistTree, currentNode) 
        }
    });
}

