function generateDash(data,geom){
	var distinctRegions = getDistinctRegions(data);
	generateButtons(distinctRegions,data);
	updateTable(data);
	updateKeyFigures(data);
	createMap(data,geom);
	processHash(data,distinctRegions);
}

function processHash(data,regions){
	var hash = decodeURIComponent(window.location.hash).substring(1);
	console.log(hash);
	if(hash=='All' || hash==''){
		hash = 'All';
		$('.regionbuttons').removeClass('highlight');
	    $('#nav0').addClass('highlight');
		update(data,data,hash);
	} else {
		$('.regionbuttons').removeClass('highlight');
		var i = regions.indexOf(hash)+1;
	    $('#nav'+i).addClass('highlight');
		var newData = data.filter(function (d) {
			return d['#region+name']==hash;
		});
		update(newData,data,hash);
	}
}

function getDistinctRegions(data){
	var unique = {};
	var distinct = [];
	for( var i in data ){
	 if( typeof(unique[data[i]['#region+name']]) == "undefined"){
	  distinct.push(data[i]['#region+name']);
	 }
	 unique[data[i]['#region+name']] = 0;
	}
	return distinct;
}

function generateButtons(regions,data){
	regions = ['All'].concat(regions);
	var html = '';
	regions.forEach(function(r,i){
		html += '<button id="nav'+i+'" type="button" class="button hollow alert regionbuttons">'+r+'</button>';
	});
	$('#filterbuttons').html(html);
	$('#nav0').addClass('highlight');
	regions.forEach(function(r,i){
		if(i==0){
			$('#nav0').on('click',function(){
				$('.regionbuttons').removeClass('highlight');
	    		$('#nav0').addClass('highlight');
				update(data,data,r);
			});
		} else {
			$('#nav'+i).on('click',function(){
				$('.regionbuttons').removeClass('highlight');
	    		$('#nav'+i).addClass('highlight');
				var newData = data.filter(function (d) {
					return d['#region+name']==r;
				});
				update(newData,data,r);
			});
		}
	});
}

function update(newData,data,r){
	updateTable(newData);
	updateKeyFigures(newData);
	updateMap(data,r);
	updateDownload(r);
	window.location.hash = encodeURIComponent(r);
}

function updateDownload(region){
	var url = "https://proxy.hxlstandard.org/data.csv?strip-headers=on&filter03=merge&merge-url03=https%3A//docs.google.com/spreadsheets/d/1rVAE8b3uC_XIqU-eapUGLU7orIzYSUmvlPm9tI0bCbU/edit%23gid%3D0&clean-date-tags01=%23date&filter02=select&merge-keys03=%23meta%2Bid&filter04=replace-map&select-query06-01=%23region%3D999999&filter05=merge&merge-tags03=%23meta%2Bcoverage%2C%23meta%2Bfunding&force=on&merge-keys05=%23country%2Bname&merge-tags05=%23country%2Bcode&filter01=clean&replace-map-url04=https%3A//docs.google.com/spreadsheets/d/1hTE0U3V8x18homc5KxfA7IIrv1Y9F1oulhJt0Z4z3zo/edit%3Fusp%3Dsharing&filter06=select&merge-url05=https%3A//docs.google.com/spreadsheets/d/1GugpfyzridvfezFcDsl6dNlpZDqI8TQJw-Jx52obny8/edit%3Fusp%3Dsharing&select-query02-01=%23date%2Bend%3E888888&url=https%3A//docs.google.com/spreadsheets/d/19pBx2NpbgcLFeWoJGdCqECT2kw9O9_WmcZ3O41Sj4hU/edit%23gid%3D0"
	if(region!='All'){
		url = url.replace('999999',encodeURIComponent(region));
		url = url.replace('888888',encodeURIComponent(date));
		$('#regiondownload').html('Download for <a href="'+url+'">'+region+'</a>');
	} else {
		$('#regiondownload').html('');
	}

}

function getAppealDocs(id){
	var url = 'https://proxy.hxlstandard.org/data.json?strip-headers=on&select-query01-01=%23meta%2Bid%3D' + id + '&filter02=cut&filter01=select&cut-include-tags02=%23meta%2Bdocumentname%2C%23date%2C%23meta%2Burl&force=on&url=https%3A//docs.google.com/spreadsheets/d/1gJ4N_PYBqtwVuJ10d8zXWxQle_i84vDx5dHNBomYWdU/edit%3Fusp%3Dsharing';

	console.log(url);

	$.ajax({
		    type: 'GET',
    		url: url,
    		dataType: 'json',
			success: function(result){
				var html = ''
				console.log(result);
				result.forEach(function(row,i){
					console.log(row);
					if(i>0){
						if(row[0].substring(0,1)=='/'){
							row[0] = 'http://www.ifrc.org'+row[0];
						}
						html+='<p><a href="'+row[0]+'" target="blank">'+row[1]+'</a> ('+row[2]+')</p>'
					}
				});
        		$("#"+id).html(html);
    		}
    	});
}

function updateTable(data){
	if ( $.fn.dataTable.isDataTable( '#datatable' ) ) {
    	table.destroy();
	}
	$('#data-table').html("");
	var html = "";
	data.forEach(function(d,i){
		if(d['#meta+type']=='DREF'){
			var url = 'http://www.ifrc.org/en/publications-and-reports/appeals/?ac='+d['#meta+id']+'&at=0&c=&co=&dt=1&f=&re=&t=&ti=&zo='
				} else {
					var url = 'http://ifrcgo.org/appeals/'+d['#meta+id'].toLowerCase()
					}
		html += '<tr><td class="details-controls" data-id="'+d['#meta+id']+'"></td><td>'+d['#meta+type']+'</td><td>'+d['#crisis+name']+'</td><td>'+d['#region+name']+'</td><td>'+d['#crisis+type']+'</td><td>'+d['#date+start']+'</td><td>'+d['#date+end']+'</td><td>'+niceFormatNumber(d['#targeted'])+'</td><td>'+niceFormatNumber(d['#meta+value'])+'</td><td>'+niceFormatNumber(d['#meta+funding'])+'</td><td id="coverage'+i+'"></td><td><a href="'+url+'" target="_blank">'+d['#meta+id']+'</a></td></tr>';
	});
	$('#tcontents').html(html);
	data.forEach(function(d,i){
		createPie('#coverage'+i,65,10,d['#meta+coverage']/100);
	});
    table = $('#datatable').DataTable({
    	"pageLength": 100,
    	"bFilter": false,
    	"aoColumnDefs" : [
	 		{
	   			'bSortable' : false,
	   			'aTargets' : [ 'sorting_disabled' ]
	 		}
	 	],
	 	"order": [[ 5, "desc" ]]
 	});
 	$('.details-controls').on('click',function () {
 		var appealID = $(this).attr('data-id');
 		var tr = $(this).closest('tr');
        var row = table.row( tr );
        if ( row.child.isShown() ) {
            row.child.hide();
            tr.removeClass('shown');
        }
        else {
            row.child('<h4>Latest Documents</h4><div id="'+appealID+'"></div>').show();
            getAppealDocs(appealID);
            tr.addClass('shown');
        }
 	});
}

function updateMap(data,region){
	var style = function(feature) {
		var color = '#aaaaaa';
		var fillOpacity = 0;
		var cls = 'country'
		if(data.map(function(e) { if(e['#region+name']==region || region=='All'){return e['#country+code']}; }).indexOf(feature.properties['ISO_A3'])>-1){
			color = '#D33F49';
			fillOpacity = 0.7;
			cls = 'appealcountry country appeal'+feature.properties['ISO_A3']
		};

        return {
                'color': color,
                'fillcolor': color,
                'weight': 1,
                'opacity': 0.7,
                'fillOpacity':fillOpacity,
                'className':cls
            };
    }
    map.overlay.setStyle(style);
    var bbox = [[90,180],[-90,-180]];
    map.overlay.eachLayer(function(l){
    	if(data.map(function(e) { if(e['#region+name']==region || region=='All'){return e['#country+code']}; }).indexOf(l.feature.properties['ISO_A3'])>-1){
    		if(bbox[0][0]>l.feature.properties.bounds_calculated._southWest.lat){bbox[0][0]=l.feature.properties.bounds_calculated._southWest.lat};
    		if(bbox[0][1]>l.feature.properties.bounds_calculated._southWest.lng){bbox[0][1]=l.feature.properties.bounds_calculated._southWest.lng};
    		if(bbox[1][0]<l.feature.properties.bounds_calculated._northEast.lat){bbox[1][0]=l.feature.properties.bounds_calculated._northEast.lat};
    		if(bbox[1][1]<l.feature.properties.bounds_calculated._northEast.lng){bbox[1][1]=l.feature.properties.bounds_calculated._northEast.lng};
		};
    });
    if(bbox[0][0] == 90){bbox = [[-80,-170],[80,170]];}
    var bounds = new L.LatLngBounds(bbox);
    map.fitBounds(bounds);
}

function createMap(data,geom){

    var baselayer = L.tileLayer('https://data.humdata.org/mapbox-base-tiles/{z}/{x}/{y}.png', {});
    var baselayer2 = L.tileLayer('https://data.humdata.org/mapbox-layer-tiles/{z}/{x}/{y}.png', {minZoom:4});

	map = L.map('map',{
				center: [0,0],
		        zoom: 2,
		        layers: [baselayer,baselayer2]
			});

	var style = function(feature) {
		var color = '#aaaaaa';
		var fillOpacity = 0;
		var cls = 'country'

		if(data.map(function(e) { return e['#country+code']; }).indexOf(feature.properties['ISO_A3'])>-1){
			color = '#D33F49';
			fillOpacity = 0.7;
			cls = 'appealcountry country appeal'+feature.properties['ISO_A3']
		};

        return {
                'color': color,
                'fillcolor': color,
                'weight': 1,
                'opacity': 0.7,
                'fillOpacity':fillOpacity,
                'className':cls
            };
    }

	map.overlay = L.geoJson(geom,{
		style:style,
		onEachFeature: function (feature, layer) {
                feature.properties.bounds_calculated=layer.getBounds();
            }
    }).addTo(map);
}

function updateKeyFigures(data){
	var totalappeals = 0;
	var totalfunding = 0;
	var totalDREF = 0;
	var totalappeal = 0;
	var totalBen = 0;
	data.forEach(function(d,i){
		totalappeals+=parseFloat(d['#meta+value']);
		totalfunding+=parseFloat(d['#meta+funding']);
		totalBen+=parseFloat(d['#targeted']);
		if(d['#meta+type']=='DREF'){
			totalDREF +=1;
		} else {
			totalappeal +=1;
		}
	});
	$('#totalappeals').html(niceFormatNumber(totalappeals,true));
	$('#totalbens').html(niceFormatNumber(totalBen,true));
	$('#totalea').html(totalappeal);
	$('#totaldref').html(totalDREF);
	$('#totalcoverage').html('');
	createPie('#totalcoverage',120,15,totalfunding/totalappeals);
}

function createPie(id,width,inner,percent){

	var svg = d3.select(id).append("svg")
		.attr("width", width)
		.attr("height", width);

	var radius = width/2;

	var fundingArc = d3.svg.arc()
		.innerRadius(radius-inner)
		.outerRadius(radius)
		.startAngle(0)
		.endAngle(Math.PI*2*percent);

	var budgetArc = d3.svg.arc()
		.innerRadius(radius-inner)
		.outerRadius(radius)
		.startAngle(0)
		.endAngle(Math.PI*2);

	svg.append("path")
		.style("fill", "#dfdfdf")
		.attr("d", budgetArc)
		.attr("transform", "translate("+(width/2)+","+(width/2)+")");

	svg.append("path")
		.style("fill", "#D33F49")
		.attr("d", fundingArc)
		.attr("transform", "translate("+(width/2)+","+(width/2)+")");

	svg.append("text")
		.attr("x",width/2)
		.attr("y",width/2+5)
		.text(d3.format(".0%")(percent))
		.style("text-anchor", "middle");
}

function niceFormatNumber(num,round){
	if(isNaN(num)){
		return num;
	} else {
		if(!round){
			var format = d3.format("0,000");
			return format(num);
		} else {
			var output = d3.format(".4s")(num);
	        if(output.slice(-1)=='k'){
	            output = Math.round(output.slice(0, -1) * 1000);
	            output = d3.format("0,000")(output);
	        } else if(output.slice(-1)=='M'){
	            output = d3.format(".1f")(output.slice(0, -1))+' million';
	        } else if (output.slice(-1) == 'G') {
	            output = output.slice(0, -1) + ' billion';
	        } else {
	            output = ''+d3.format(".3s")(num);
	        }
	        return output;
		}
	}
}

function hxlProxyToJSON(input,headers){
    var output = [];
    var keys=[]
    input.forEach(function(e,i){
        if(i==0){
            e.forEach(function(e2,i2){
                var parts = e2.split('+');
                var key = parts[0]
                if(parts.length>1){
                    var atts = parts.splice(1,parts.length);
                    atts.sort();
                    atts.forEach(function(att){
                        key +='+'+att
                    });
                }
                keys.push(key);
            });
        } else {
            var row = {};
            e.forEach(function(e2,i2){
                row[keys[i2]] = e2;
            });
            output.push(row);
        }
    });
    return output;
}

function dataPrep(data){
	data.forEach(function(d){
		if(d['#meta+coverage']==""){
			d['#meta+coverage']=100;
			d['#meta+funding']=d['#meta+value'];
			d['#meta+type']='DREF';
		} else {
			d['#meta+coverage']=parseInt(d['#meta+coverage'].slice(0, -1));
			d['#meta+type']='EA';
		}
		if(isNaN(parseFloat(d['#meta+value']))){
			console.log("Data Error - #meta+value: "+d['#meta+value']);
			console.log(d);
			d['#meta+value']=0;
		}
		if(isNaN(parseFloat(d['#targeted']))){
			console.log("Data Error - #targeted: "+d['#targeted']);
			console.log(d);
			d['#targeted']=0;
		}
		if(isNaN(parseFloat(d['#meta+funding']))){
			console.log("Data Error - #meta+funding: "+d['#meta+funding']);
			console.log(d);
			d['#meta+funding']=0;
		}
	});
	return data;
}

//global vars

var map = '';
var table='';
// $('#loadingmodal').modal('show');
var appealsurl = 'https://proxy.hxlstandard.org/data.json?strip-headers=on&filter03=merge&clean-date-tags01=%23date&filter02=select&merge-keys03=%23meta%2Bid&filter04=replace-map&filter05=merge&merge-tags03=%23meta%2Bcoverage%2C%23meta%2Bfunding&select-query02-01=%23date%2Bend%3E999999&merge-keys05=%23country%2Bname&merge-tags05=%23country%2Bcode&filter01=clean&replace-map-url04=https%3A//docs.google.com/spreadsheets/d/1hTE0U3V8x18homc5KxfA7IIrv1Y9F1oulhJt0Z4z3zo/edit%3Fusp%3Dsharing&merge-url03=https%3A//docs.google.com/spreadsheets/d/1rVAE8b3uC_XIqU-eapUGLU7orIzYSUmvlPm9tI0bCbU/edit%23gid%3D0&merge-url05=https%3A//docs.google.com/spreadsheets/d/1GugpfyzridvfezFcDsl6dNlpZDqI8TQJw-Jx52obny8/edit%3Fusp%3Dsharing&url=https%3A//docs.google.com/spreadsheets/d/19pBx2NpbgcLFeWoJGdCqECT2kw9O9_WmcZ3O41Sj4hU/edit%23gid%3D0'
var today = new Date();
var dd = today.getDate();
var mm = today.getMonth()+1;
var yyyy = today.getFullYear();
if(dd<10) {
    dd='0'+dd
}
if(mm<10) {
    mm='0'+mm
}
var date = yyyy + '-' + mm + '-' + dd;
appealsurl = appealsurl.replace('999999',date);
var downloadurl = 'https://proxy.hxlstandard.org/data.csv?strip-headers=off&filter03=merge&clean-date-tags01=%23date&filter02=select&merge-keys03=%23meta%2Bid&filter04=replace-map&force=on&filter05=merge&merge-tags03=%23meta%2Bcoverage%2C%23meta%2Bfunding&select-query02-01=%23date%2Bend%3E999999&merge-keys05=%23country%2Bname&merge-tags05=%23country%2Bcode&filter01=clean&replace-map-url04=https%3A//docs.google.com/spreadsheets/d/1hTE0U3V8x18homc5KxfA7IIrv1Y9F1oulhJt0Z4z3zo/edit%3Fusp%3Dsharing&merge-url03=https%3A//docs.google.com/spreadsheets/d/1rVAE8b3uC_XIqU-eapUGLU7orIzYSUmvlPm9tI0bCbU/edit%23gid%3D0&merge-url05=https%3A//docs.google.com/spreadsheets/d/1GugpfyzridvfezFcDsl6dNlpZDqI8TQJw-Jx52obny8/edit%3Fusp%3Dsharing&url=https%3A//docs.google.com/spreadsheets/d/19pBx2NpbgcLFeWoJGdCqECT2kw9O9_WmcZ3O41Sj4hU/edit%23gid%3D0';
var downloadurl = downloadurl.replace('999999',date);
$('#download_link').html('<a href="'+downloadurl+'" target="_blank">Download Data</a>');

var dataCall = $.ajax({
    type: 'GET',
    url: appealsurl,
    dataType: 'json',
});

var geomCall = $.ajax({
    type: 'GET',
    url: worldmap,
    dataType: 'json'
});

$.when(dataCall, geomCall).then(function(dataArgs, geomArgs){
    var data = dataPrep(hxlProxyToJSON(dataArgs[0]));
    console.log(data);
    var geom = topojson.feature(geomArgs[0],geomArgs[0].objects.geom);
    // $('#loadingmodal').modal('hide');
    generateDash(data,geom)
});
