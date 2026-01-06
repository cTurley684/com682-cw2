//The URIs of the REST endpoint
RAAURI = "https://prod-20.norwayeast.logic.azure.com/workflows/34cf73755289451ebf83f86899ef4753/triggers/When_an_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_an_HTTP_request_is_received%2Frun&sv=1.0&sig=b-ax5EDY147_JaLJtoQ-b5o3neP3NbwreOczgN3RrJA";
CIAURI = "https://prod-24.norwayeast.logic.azure.com/workflows/fe948bc2a4444b2a8f3962afcca869dd/triggers/When_an_HTTP_request_is_received/paths/invoke/rest/v1/assets?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_an_HTTP_request_is_received%2Frun&sv=1.0&sig=dZzHQ60UDZOgGu9P2q5LCst3kXPQcZXlyybecjLxaiw";

DIAURI0 = "https://prod-25.norwayeast.logic.azure.com/workflows/e5305d9597b6408fb642048ba71e6dda/triggers/When_an_HTTP_request_is_received/paths/invoke/rest/v1/assets/";
DIAURI1 = "?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_an_HTTP_request_is_received%2Frun&sv=1.0&sig=wsRpejbWV1Sm28yEw2e2Lj5iD3AejS_FhU2XXy5wyJ0";


//Handlers for button clicks
$(document).ready(function() {

 
  $("#retAssets").click(function(){

      //Run the get asset list function
      getAssetList();

  }); 

   //Handler for the new asset submission button
  $("#subNewForm").click(function(){

    //Execute the submit new asset function
    submitNewAsset();
    
  }); 
});

//A function to submit a new asset to the REST endpoint 
function submitNewAsset(){
  
//Construct JSON Object for new item
  var subObj = {
    AssetLabel: $('#AssetLabel').val(),
    Cost: $('#Cost').val(),
    AssetType: $('#AssetType').val(),
    NameOfOwner: $('#NameOfOwner').val(),
    AddressLine1: $('#AddressLine1').val(),
    AddressLine2: $('#AddressLine2').val(),
    Note: $('#Note').val()
  }

  //Convert to a JSON String
  subObj = JSON.stringify(subObj);

  //Post the JSON string to the endpoint, note the need to set the content type header
  $.post({
    url: CIAURI,
    data: subObj,
    contentType: 'application/json; charset=utf-8'
  }).done(function (response) {
        getAssetList();
  });

}

//A function to get a list of all the assets and write them to the Div with the AssetList Div
function getAssetList(){

  //Replace the current HTML in that div with a loading message
  $('#AssetList').html('<div class="spinner-border" role="status"><span class="sr-only"> &nbsp;</span>');

  $.getJSON(RAAURI, function( data ) {

    //Create an array to hold all the retrieved assets
    var items = [];
      
    //Iterate through the returned records and build HTML, incorporating the key values of the record in the data
      $.each( data, function( key, val ) {

          items.push( "Asset Label: " + val["AssetLabel"] + ", Cost: " + val["Cost"] + "<br/>");
          items.push( "Asset Type: " + val["AssetType"] + ", Asset Label: " + val["NameOfOwner"]+ "<br/>");
          items.push( "Address Line 1: " + val["AddressLine1"] + "<br/>");
          items.push( "Address Line 2: " + val["AddressLine2"] + "<br/>");
          items.push( "Note: " + val["Note"] + "<br/>");
          items.push('<button type="button" id="subNewForm" class="btn btn-danger"  onclick="deleteAsset('+val["AssetID"] +')">Delete</button> <br/><br/>');
          
      });

      //Clear the assetlist div 
      $('#AssetList').empty();

      //Append the contents of the items array to the AssetList Div
      $( "<ul/>", {
        "class": "my-new-list",
        html: items.join( "" )
      }).appendTo( "#AssetList" );
    });
}

//A function to delete an asset with a specific ID.
//The id paramater is provided to the function as defined in the relevant onclick handler
function deleteAsset(id){
   $.ajax({           

    type: "DELETE",
    //Note the need to concatenate the 
    url: DIAURI0 + id + DIAURI1,

  }).done(function( msg ) {
    //On success, update the assetlist.
    getAssetList();
  });
}
