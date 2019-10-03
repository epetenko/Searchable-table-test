// Most of the action here is described in Weed_map.js. Skip to ~373 to see where points are added, etc.
var geoJsonObject;

var pymChild = null;

$(document).ready(function() {
var today = new Date();
var dd = today.getDate();
var mm = today.getMonth() + 1; //January is 0!
var yyyy = today.getFullYear();

if (dd < 10) {
  dd = '0' + dd;
}

if (mm < 10) {
  mm = '0' + mm;
}

today = mm + '/' + dd + '/' + yyyy;
$('#date').html(today);
    // Dropdown Function Pt. 1
    var usedNames = [];

    var config = {
        '.chosen-select': {},
        '.chosen-select-deselect': {
            allow_single_deselect: true
        },
        '.chosen-select-no-single': {
            disable_search_threshold: 10
        },
        '.chosen-select-no-results': {
            no_results_text: 'Oops, nothing found!'
        },
        '.chosen-select-width': {
            width: "95%"
        }
    }
    for (var selector in config) {
        $(selector).chosen(config[selector]);
    }

    var dropdown_county1 = $('select.chosen-select.county1'),
        dropdown_town1 = $('select.chosen-select.town1'),
        grid = $('.grid')


    var mobile_threshold = 450;
    var winwidth = parseInt(d3.select('#mapcanvas').style('width'))
    var winheight = parseInt(d3.select('#mapcanvas').style('height'))

    var isMobile = isMobile(winwidth);


    function isMobile(w) {
        if (w < mobile_threshold) {
            return true
        } else {
            return false
        }
    }

    map = new L.Map('mapcanvas', {
        attributionControl: false,
        // minZoom: isMobile? 6.5:5.5,
        scrollWheelZoom: false
    });
    map.createPane('labels');
    map.getPane('labels').style.zIndex = 550;
    map.getPane('labels').style.pointerEvents = 'none';
    var osm = new L.tileLayer('http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
        attribution: '©OpenStreetMap, ©CartoDB',
    });
    map.addLayer(osm);
    var positronLabels = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png', {
        attribution: '©OpenStreetMap, ©CartoDB',
        pane: 'labels'
    }).addTo(map);
    map.setView(new L.LatLng(44.095, -72.772), 8
        // isMobile? 7.5:8.5
    );

    var points_id = '1mAkQ0pXLmhNSYpgDsO-ruypLhAs3Hm4cZ6T-2wDQmII'


    var svg = d3.select(map.getPanes().overlayPane).append("svg"),
        g = svg.append("g").attr("class", "leaflet-zoom-hide");

    // The tooltip
    var div = d3.select("#mapcanvas").append("div")
        .attr("class", "tooltip")
        .html("<h2>Loading...</h2>")
        .style("top", "0px")
        .style("left", winwidth - 180 + "px")

    var spreadsheet_id = "1mAkQ0pXLmhNSYpgDsO-ruypLhAs3Hm4cZ6T-2wDQmII"
    queue()
        .defer(d3.json, "js/tl_2019_50_cousub.json")
        .defer(d3.csv, "data/Priest_by_assignment_test.csv")
        .await(ready);




    function ready(error, us, data) {

        var priest_key = {};
        var lat = {};
        var lng = {};
        var location = {};
        var status = {};
        var census2010 = {};
        // var town_name = {};
        // var county = {};
        // var just_town = {};
        // var dispensary = {};


        data.forEach(function(d) {
            priest_key[d.priest_key] = d.priest_key;
            lat[d.priest_key] = +d.lat;
            lng[d.priest_key] = +d.lng;
            status[d.census2010] = d.status;


            // if (usedNames.indexOf(d.county) == -1) {
            //            var option = $('<option value="' + d.county + '">' + d.county + '</option>');

            //            dropdown_county1.append(option);
            //            usedNames.push(d.county);
            //        };

        });

        // var max = d3.max(data, function(d) { return d.sen_dem; } );
        // var min = d3.min(data, function(d) { return d.sen_dem; } );



        function isNegative(x) {
            if (x >= 0) {
                return "+"
            } else {
                return ""
            }
        }

        function addCommas(nStr) {
            nStr += '';
            x = nStr.split('.');
            x1 = x[0];
            x2 = x.length > 1 ? '.' + x[1] : '';
            var rgx = /(\d+)(\d{3})/;
            while (rgx.test(x1)) {
                x1 = x1.replace(rgx, '$1' + ',' + '$2');
            }
            return x1 + x2;
        }

        function round_num(x) {
            if (x) {
                return x.toFixed(1)
            } else {
                return x
            }
        }



        // Dropdown Function Pt. 2

        // dropdown_county1.trigger("chosen:updated");
        // dropdown_county1.chosen().on('chosen:showing_dropdown', function() {
        //     pymChild = new pym.Child();
        // });

        // dropdown_county1.on('change', function(e, params) {
        //     grid.html("")
        //     //Make town and right-side county options appear
        //     $('#town1').show();
        //     //Empty any previous town options
        //     dropdown_town1.empty();
        //     var emptyoption = $('<option value=""></option>');
        //     dropdown_town1.append(emptyoption).trigger('chosen:updated')
        //     //Fetches the county picked from the left-side county dropdown
        //     county1value = e.target.value;

        //     //Initiates populate_cards function
        //     populate_towns(county1value, dropdown_town1)

        // });


        dropdown_town1.on('change', function(e, params) {
            grid.html("")
            var emptyoption = $('<option value=""></option>');
            dropdown_town1.append(emptyoption).trigger('chosen:updated')
            //Fetches the town picked from the left-side town dropdown
            town1value = e.target.value;
            //Initiates populate_cards function
            populate_cards(town1value, grid, dropdown_town1)
        })

        // function populate_towns(btn_value, thedropdown) {

        //     //A loop that goes through the entry array created earlier 
        //     data.forEach(function(d) {
        //         if (btn_value == d.county) {
        //             // Add all towns in the picked county into the town dropdown
        //             var townoption = $('<option value="' + d.town_name + '">' + d.town_name + '</option>');
        //             thedropdown.append(townoption);
        //         }
        //         // Update all dropdown menus after changes
        //         dropdown_town1.trigger("chosen:updated");
        //     })
        // }

var jqueryNoConflict = jQuery;



// begin main function
jqueryNoConflict(document).ready(function(){




    // Change google spreadsheet link here

    initializeTabletopObject('https://docs.google.com/spreadsheets/d/1VkC4zdxYaTWqi5iC72ClayRaV8GZMg0cBAgkU3RunJI/pubhtml');


});




var width = $('body').width()



// pull data from google spreadsheet
function initializeTabletopObject(dataSpreadsheet){
    Tabletop.init({
        key: dataSpreadsheet,
        callback: writeTableWith,
        simpleSheet: true,
        debug: false
    });


}

// // create table headers
// function createTableColumns(){



//     /* swap out the properties of mDataProp to reflect
//     the names of columns in the Google Sheet. Swap out the properties of sTitle for the column title you want displayed. */


//     var tableColumns =   [
//         {'mDataProp': 'County', 'sTitle': 'County', 'sClass': 'left'},
//         {'mDataProp': 'District', 'sTitle': 'District', 'sClass': 'left'},
//         {'mDataProp': '2017-18 Total K-12 Aid', 'sTitle': '2017-18 Total K-12 Aid', 'sClass': 'right'},
//         {'mDataProp': '2018-19 Total K-12 Aid2', 'sTitle': '2018-19 Total K-12 Aid', 'sClass': 'right'},
//         {'mDataProp': 'One Year K-12 Aid Difference', 'sTitle': 'One Year K-12 Aid Difference', 'sClass': 'right'},
//         {'mDataProp': 'Aid Percent Difference', 'sTitle': 'Aid Percent Difference', 'sClass': 'right'}
//     ];
//     return tableColumns;

// }
var table = null;
// create the table container and object
function writeTableWith(dataSource){
    console.log(dataSource)
    //First, we create column headers. Any column header with the class 'all' will be shown by default, any header with the class 'none' will be hidden by default

    $( "thead" ).append( "<tr><th class='all'>Name</th><th class='none'>Ordainment</th><th class='none'>Year faculties withdrawn</th><th class='none'>Year lacized</th><th class='none'>Retired</th><th class='none'>Died</th><th class='none'>Assignments</th><th class='none'>Additional notes</th></tr>" );


 

//We create the datatable 

 table = $('#incidents_table').DataTable({
    "pageLength": 50,
    "deferRender": true,
    "data": dataSource,
    "rowReorder": {
        selector: 'td:nth-child(2)'
    },
    "responsive": {

        // This is where the hidden columns are rendered 
        "details": {
            type: 'column',

            renderer: function ( api, rowIdx, columns ) {
                var data = $.map( columns, function ( col, i ) {
                   

                    return col.hidden ?
                        '<tr data-dt-row="'+col.rowIndex+'" data-dt-column="'+col.columnIndex+'">'+
                            '<td style="font-weight:bold;">'+col.title+':'+'</td> '+
                            '<td id="ass-table">'+ format(col.data) + '</td>'+
                        '</tr>' :
                        '';
                } ).join('');

            var pymChild = new pym.Child(); 
                return data ?
                    $('<table/>').append( data ) :
                    false;

            }


        }

    },
    "columns": [
        {
             "data": null,
            render: function(data,type,row, meta) {

                // This is where each column of data is rendered, depending on what it's called in the json. This part renders the first and last name together in the same column. It also displays the first name and last name together but then lets you sort by last name.



                if (type === 'display') {
                    data = '' +
                        data['First middle initial'] +
                        ' ' + data['Last'] +
                        '';
                }

                

                else if (type ==='filter') {
                    data = data['First middle initial'] + ' ' + data['Last'];
                }

                else if (type == "sort" || type == 'type') {

                    data = data['Last'];
                }

                return data;
            },
            'className': 'priest-label details-control'
        },
          {
            "data": null,
            render: function(data,type,row, meta) {

                    data = '' +
                        data['Ordainment year'] +
                        ' in ' + data['Ordainment city'] +
                        '';


                return data;
            },
        },
          {

             "data": null,
            render: function(data,type,row, meta) {

                // This is where each column of data is rendered, depending on what it's called in the json. This part renders the first and last name together in the same column. It also displays the first name and last name together but then lets you sort by last name.

                if (data['Year faculties withdrawn if listed']) {
                    data = data['Year faculties withdrawn if listed'];
                }  else {
                    data  ='N/A';
                }
                return data;
            },


        },
        {
            // This part renders the year born into a datetime year so we can actually sort
             "data": null,
            render: function(data,type,row, meta) {

                // This is where each column of data is rendered, depending on what it's called in the json. This part renders the first and last name together in the same column. It also displays the first name and last name together but then lets you sort by last name.

                if (data['Year lacized if listed']) {
                    data = data['Year lacized if listed'];
                }  else {
                    data  ='N/A';
                }
                return data;
            },

        },
        {
             "data": null,
            render: function(data,type,row, meta) {

                // This is where each column of data is rendered, depending on what it's called in the json. This part renders the first and last name together in the same column. It also displays the first name and last name together but then lets you sort by last name.

                    if (data['Retired if listed']) {
                        data = data['Retired if listed'];
                    }  else {
                        data  ='N/A';
                    }
                    return data;
                },        
            },
         {
            "data": null,
            render: function(data,type,row, meta) {

                // This is where each column of data is rendered, depending on what it's called in the json. This part renders the first and last name together in the same column. It also displays the first name and last name together but then lets you sort by last name.

                if (data['Died if listed']) {
                    data = data['Died if listed'];
                }  else {
                    data  ='N/A';
                }
                return data;
            },

        },
        {
            "data": "Assignments"
        },

        {
           "data": null,
            render: function(data,type,row, meta) {

                // This is where each column of data is rendered, depending on what it's called in the json. This part renders the first and last name together in the same column. It also displays the first name and last name together but then lets you sort by last name.

                if (data['Additional notes']) {
                    data = data['Additional notes'];
                }  else {
                    data  ='N/A';
                }
                return data;
            },
        },
         {
            // Added this so we can default sort the names by last name without making visible
            "data": "Last",
            "visible": false
        }
    ],

    "order": [
        [8, 'asc']
    ]
}).on( 'order.dt',  function () {  
       var pymChild = new pym.Child(); 
       } )
        .on( 'search.dt', function () { 
        var pymChild = new pym.Child(); 
 } )
        .on( 'page.dt',   function () { 

        var pymChild = new pym.Child(); 

} )
        .on( 'length.dt',  function () {  
       var pymChild = new pym.Child(); 
       } )

    function format(v) {

        if (v) { 

        ass_list = v.split(';')
        ass_holder = '<ul>';

        $.each(ass_list, function(index, value){
                this_ass = '<li id="single_assignment">'  + value + "</li>"
                ass_holder = ass_holder + this_ass
            })

        return ass_holder + "</ul>"
    } else {
        return "N/A"
    }
            
    }

$('#incidents_table').on('click', 'td.details-control', function () {
       
       var pymChild = new pym.Child();  
    });





    $( ".loading" ).hide();


    


 



};

    $('#incidents_table').on( 'draw.dt', function () {
    var pymChild = new pym.Child(); 
} );





function displaylength(bodywidth) {
    if (bodywidth > 450)
    {
        return 25
    }
    else {
        return 10
    }
}



//define two custom functions (asc and desc) for string sorting
jQuery.fn.dataTableExt.oSort['string-case-asc']  = function(x,y) {
    return ((x < y) ? -1 : ((x > y) ?  0 : 0));
};

jQuery.fn.dataTableExt.oSort['string-case-desc'] = function(x,y) {
    return ((x < y) ?  1 : ((x > y) ? -1 : 0));
};



        var legend_width = 250,
            divisions = 8;


        // var svg2 = d3.select("#legend").append("svg")
        // var legend = svg2.append("g").attr("transform", "translate(5,25)")

        // var EqualColor = "#f7f7f7",
        //       TrumpColorMax = "#a50f15",
        //       ClintonColorMax = "#08519c";
        //       var PercentMax = 55;
        //       var PercentMin = -55;


        //  var TrumpColor = d3.scale.linear()
        //         .range([EqualColor, TrumpColorMax])
        //         .domain([0,PercentMax])
        //         .interpolate(d3.interpolateLab);

        // var ClintonColor = d3.scale.linear()
        //     .range([EqualColor, ClintonColorMax])
        //     .domain([0,PercentMax])
        //     .interpolate(d3.interpolateLab);

        //         var fakeData = [];
        //     var rectWidth = Math.floor(legend_width / divisions);
        //     for (var i=0; i < legend_width; i+= rectWidth ) {
        //         fakeData.push(i);
        //     }


        //     var ClintonScaleLegend = d3.scale.linear()
        //           .domain([0, fakeData.length-1])
        //           .interpolate(d3.interpolateLab)
        //           .range([EqualColor, ClintonColorMax]);
        //     var ClintonLegend = legend.append("g").attr("class", "ClintonLegend");

        //     ClintonLegend.selectAll("rect")
        //         .data(fakeData)
        //         .enter()
        //         .append("rect")
        //             .attr("x", function(d) { return d; })
        //             .attr("y", 10)
        //             .attr("height", 10)
        //             .attr("width", rectWidth)
        //             .attr("fill", function(d, i) { return ClintonScaleLegend(i)});

        //     legend.append("text").text("DIFFERENCE 2012 vs. 2016").attr("transform", "translate("+legend_width/3+",60)").style('font-weight', 'bold');
        //     legend.append("text").text("CLINTON/BUONO").attr("transform", "translate("+(0)+",0)");
        //     legend.append("text").text(function(){return "+0%";}).attr("transform","translate(0,35)");
        //     legend.append("text").text(function(){return "+" + (PercentMax*1).toFixed(0) + "%";}).attr("transform","translate("+(legend_width)+",35)");


        var DemColor = d3.scale.quantize()
            .domain([0, 20])
            .range(['rgba(123,204,196,0.5)','rgba(67,162,202,0.5)','rgba(8,104,172,0.5)']);

        var DemSize = d3.scale.quantize()
            .domain([1,20])
            .range([4,7,9,12,15])


        // var legend = d3.select('#legend')
        //     .append('ul')
        //     .attr('class', 'list-inline');

        // var keys = legend.selectAll('li.key')
        //     .data(DemColor.range());

        // //when is this going to over
        // //Let me know 

        // keys.enter().append('li')
        //     .attr('class', 'key')
        //     .style('border-top-color', String)
        //     .text(function(d) {
        //         var r = DemColor.invertExtent(d);
        //         return d3.round(r[0]) + "%";
        //     });


        $(".waiting").remove();

        collection = topojson.feature(us, us.objects.tl_2019_50_cousub)

        var transform = d3.geo.transform({
                point: projectPoint
            }),
            path = d3.geo.path().projection(transform);
        var feature = g.selectAll("path")
            .data(collection.features)
            .enter().append("path")
            .attr('style', 'pointer-events:visiblePainted;') // WORKAROUND: required for leaflet 1.0.0-rc1
            .style("stroke", "#000")
            .style("stroke-opacity", 0.5)
            .style("stroke-width", 0.3)
            .attr('class', 'njmunis')
            .attr('id', function(d) {
                return d.properties.GEOID;
            })
            .attr('d', path)
            // .on("mouseover", mousemove)
            // .on("mousemove", mousemove)
            // .on("click", mousemove)
    // var pointsGroup = L.layerGroup();
    // data.forEach(function(d){
    //   latlng = [d.lat, d.lng]
    //     // binding data to marker object's option
    //     L.marker(latlng, { achieve: d.status })
    //         .on("mouseover", mousemove)
    //         .addTo(pointsGroup);
    // });

    // pointsGroup.addTo(map);
var nesteddata = d3.nest()
            .key(function(d) {
                return d["Location"];
            })
            .rollup(function(values) {
                return {
                    lat: d3.mean(values, function(d) {
                        return parseFloat(d["lat"])
                    }),

                    lng: d3.mean(values, function(d) {
                        return parseFloat(d["lng"])
                    }),
                    // meanPot: d3.mean(values, function(d) {
                    //     return d["Legalizing marijuana"]
                    // }),
                    // meanNJTransit: d3.mean(values, function(d) {
                    //     return d["Improving roads and NJ Transit"]
                    // }),
                    // meanSchools: d3.mean(values, function(d) {
                    //     return d["Public school and state college funding"]
                    // }),
                    // meanCrime: d3.mean(values, function(d) {
                    //     return d["Fighting crime"]
                    // }),
                    totalvotes: values.length


                };
            })
            .entries(data);
// This parses the lat/lang of the data for Leaflet to read
nesteddata.forEach(function(d) {
    d.LatLng = new L.LatLng(parseFloat(d.values.lat),
                            parseFloat(d.values.lng))
})

// Creating the points 
var points = g.selectAll("circle")
        .data(nesteddata)
        .enter().append("circle")
        .style("stroke", "black")  
        .style("opacity", 1) 
        .style("fill", function(d){
            return DemColor(d.values.totalvotes)
        })
        .style('z-index', 750)
        .attr("r", function(d){
            return DemSize(d.values.totalvotes)
        })
        .on('click', mousemove)

// Moves the points to correspond to Leaflet's latlang spot
map.on("moveend", update);
update();

        function update() {
            points.attr("transform", 
            function(d) { 
                return "translate("+ 
                    map.latLngToLayerPoint(d.LatLng).x +","+ 
                    map.latLngToLayerPoint(d.LatLng).y +")";
                }
            )
        }


        // .on("mouseout", function(d) { 

        // feature.style({
        //          'stroke-opacity': 0.6,
        //          'stroke': '#444',
        //          "stroke-width": 0.5
        //      });  
        //   div.style("opacity", 0)
        // });


        map.on("moveend", reset);
        reset();

        function reset() {
            var bounds = path.bounds(collection),
                topLeft = bounds[0],
                bottomRight = bounds[1];
            svg.attr("width", bottomRight[0] - topLeft[0])
                .attr("height", bottomRight[1] - topLeft[1])
                .style("left", topLeft[0] + "px")
                .style("top", topLeft[1] + "px");
            g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");
            feature.attr("d", path);
        }

        function projectPoint(x, y) {
            var point = map.latLngToLayerPoint(new L.LatLng(y, x));
            this.stream.point(point.x, point.y);
        }

        div.html("<h2>Click for more info</h2>")

        feature.style("fill", "#f5f5f5")

        // feature.style("fill", function(d) {



        //         if (category[d.id] == 'YES') {
        //             return '#55951b'
        //         } else if (category[d.id] == 'NO') {
        //             return '#05668D'
        //         } else if (category[d.id] == 'ACTIVE') {
        //             return '#80CED7'
        //         } else {
        //             return '#f5f5f5'
        //         }

        //         // return DemColor(sen_dem[d.id] - sen_dem_2012[d.id])


        //     })
        //     .style('stroke', function (d){
        //         if (dispensary[d.id] == 'Open') {
        //             return '#000'
        //         } else {
        //             return '#000'
        //         }
        //     })
        //     .style("stroke-opacity", 0.5)
        //     .style('stroke-width', function (d){
        //         if (dispensary[d.id] == 'Open') {
        //             return 3
        //         } else {
        //             return 0.4
        //         }
        //     })
        function mousemove(d) {
            // feature.style({
            //     'stroke-opacity': 0.6,
            //     'stroke': '#444',
            //     "stroke-width": 0.5
            // })
            table.search( d.key).draw();
            // d3.select(this.parentNode.appendChild(this))
            //     // .style({
            //     //     'stroke-opacity': 1,
            //     //     'stroke': '#5C5C5C',
            //     //     "stroke-width": 1.5
            //     // });
            // div.style("opacity", .95)
            //     // .attr('style', 'pointer-events:visiblePainted;')
            //     .style('z-index', 1000)
            // div.html("<div class='category " + d.key + "''>" + d.key + "</div><div id='infobox'><table class='muni_elex'></table>")
            // // div
            // //    .style("left", (mobileoffset(d3.event.pageX) + 10) + "px")
            // //    .style("z-index", 1400)
            // //    .style("top", (d3.event.pageY) + "px");
            // priest_holder = "<div class='priest-container'>";
            // priest_list = [];
            // data.forEach(function(a) {
            //     if (a.Location == d.key) {
            //         if (priest_list.indexOf(a.Priest_key) >= 0) {
            //             priest_line = "<div class='ass-line'>" + a.Church + ": " + a.Position + ", "+ a.Year +"</div>" 
            //             priest_holder += priest_line
            //         } else {
            //             priest_line = "<hr><div class='subhead'>" + a.Priest_key + "</div><div class='liltopper'>Assignments:</div><div class='ass-line'>" + a.Church + ": " + a.Position + ", "+ a.Year +"</div>" 
            //             priest_list.push(a.Priest_key)
            //             priest_holder = priest_holder + priest_line

            //     }

            //     }
            // })

            d3.select('.muni_elex').html(priest_holder + "</div>")

            function mobileoffset(d) {

                var xoff = winwidth - d;
                var xper = xoff / winwidth;


                if (winwidth < 400 && xper < 0.55) {

                    return d - winwidth / 2;
                } else {
                    return d;
                }

            }
        }




        function mobileoffset(d) {

            var xoff = winwidth - d;

            var xper2 = xoff / winwidth;


            var xper = 1 - xper2

            if (xper > 0.50) {


                return -175;
            } else if (xper <= 0.50) {
                return -10;
            }

        }

        d3.select("#Open-button").on("click", function() {
            points
                .transition()
                .style("fill", function(d) {
                    if (d.status.toUpperCase() == 'OPEN') {
                        return '#55951b'
                    } else {
                        return "rgba(255,255,255, 0.2)"
                    }
                })
        });

        d3.select("#No-button").on("click", function() {
            points
                .transition()
                .style("fill", function(d) {
                    if (d.status.toUpperCase() == 'PENDING') {
                        return '#05668D'
                    } else {
                        return "rgba(255,255,255, 0.2)"
                    }
                })
        });
        d3.select("#Pending-button").on("click", function() {
            points
                .transition()
                .style("fill", function(d) {
                    if (d.status == 'PENDING') {
                        return '#80CED7'
                    } else {
                        return "rgba(255,255,255, 0.2)"
                    }

                })
        });
        d3.select("#Reset-button").on("click", function() {
            points
                .transition()
                .style("fill", function(d) {
                     if (d.status.toUpperCase() == 'OPEN') {
                                    return '#55951b'
                                } else {
                                    return '#80CED7';
                                }                
                })
        });




        var pymChild = new pym.Child();

        pymChild.sendHeight();
    }

function test_hyperlink(link) {
    if (link =='N/A') {
        return ''
    } else {
        return 'Read more'
    }
}


    //d3 code stolen from http://bost.ocks.org/mike/leaflet/#init




});