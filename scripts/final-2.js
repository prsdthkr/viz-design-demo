// d3.squareMap.setAttr({
//     colorSet: 'Greys',
//     labelStyle: 'abbr'
// }).render('data/size-of-communities.csv', '.map-container');
// $(window).on("load", function () {

// })


//shamelessly copy pasted from stackoverflow:
//https://stackoverflow.com/questions/9461621/format-a-number-as-2-5k-if-a-thousand-or-more-otherwise-900
//author:https://stackoverflow.com/users/87015/salman-a
function nFormatter(num, digits) {
    var si = [
        { value: 1, symbol: "" },
        { value: 1E3, symbol: "k" },
        { value: 1E6, symbol: "M" },
        { value: 1E9, symbol: "G" },
        { value: 1E12, symbol: "T" },
        { value: 1E15, symbol: "P" },
        { value: 1E18, symbol: "E" }
    ];
    var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    var i;
    for (i = si.length - 1; i > 0; i--) {
        if (num >= si[i].value) {
            break;
        }
    }
    return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
}

const gSelector = (ABBR) => {
    return 'g#' + ABBR;
}

const rectSelector = (ABBR) => {
    return 'rect#' + ABBR + '_2';
}

const selectStateRect = (ABBR) => {
    return d3.select(rectSelector(ABBR))
}

const selectStateG = (ABBR) => {
    return d3.select(gSelector(ABBR))
}

const getAtt = function (ABBR, key) {
    if (!ABBR) return;
    let val = selectStateRect(ABBR).attr(key);
    return val ? val : 0;
};

const setAtt = function (ABBR, key, value) {
    if (!ABBR) return;
    selectStateRect(ABBR).attr(key, value);
};
var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
window.onload = function () {

    d3.json('data/states.json', function (sd) {
        console.log('states', Object.entries(sd));

        // d3.select('#statesRef')
        //     .selectAll('li')
        //     .data(Object.entries(sd))
        //     .enter()
        //     .append('li')
        //     .attr('class', 'abr-li')
        //     .html(d => d[0] + ":" + d[1]);

        d3.csv('data/rich-size-of-communities-2.csv', function (d) {
            d.forEach(element => {
                // console.log(element);
                const ABBR = element['Abr.'];
                const communitySize = element['Community'];
                const two15 = float(element['2015 charges']);
                const two16 = float(element['2016 charges']);
                const two17 = float(element['2017 charges']);
                const percentInc = float(element['Percent Incidents']);
                const avgRate = (two15 + two16 + two17) * 100 / 3;
                if (!ABBR) return;

                // console.log('percent yall', element['Percent Incidents']);

                //placement calculations
                const outThreshold = 30;
                const tileWidth = getAtt(ABBR, 'width');
                const tileHeight = getAtt(ABBR, 'height');
                const tileY = int(getAtt(ABBR, 'y'));
                const tileX = int(getAtt(ABBR, 'x'));


                //render outside tile?
                let communitySizeY = center(ABBR, 'y', 15);
                let communitySizeX = rightEdge(ABBR, 'x', 10);
                let communityFontSize = '12px';


                let stateAbrY = center(ABBR, 'y');
                let stateAbrX = communitySizeX;
                const abrFontSize = '20px'


                let percentY = center(ABBR, 'y', 30);
                let percentX = communitySizeX;
                const percentFontSize = '12px'


                //render inside tile?
                const fontScale = d3.scale.linear().domain([1194000, 131000])
                    .range([80, 12]);
                const leftPadding = 5;

                if (int(tileWidth) >= outThreshold + leftPadding) {
                    const leftMargin = tileX + leftPadding;

                    const stateAbrFontOffset = pixelToNumber(abrFontSize);
                    stateAbrY = tileY + stateAbrFontOffset;
                    stateAbrX = leftMargin;

                    communityFontSize = getFontSize(fontScale, communitySize);
                    const fontOffset = fontScale(int(communitySize));
                    communitySizeY = stateAbrY + fontOffset;
                    communitySizeX = leftMargin;

                    const percentFontOffset = pixelToNumber(abrFontSize);
                    percentY = communitySizeY + percentFontOffset;
                    percentX = leftMargin;
                }


                //render

                selectStateG(ABBR)
                    .data([element])
                    .attr('class', 'state-tile-ctr')
                    .on('mouseover', handleMouseOverRect)
                    .on('mouseout', handleMouseOutRect)
                selectStateRect(ABBR)
                    .attr('class', 'state-tile')

                //CA
                selectStateG(ABBR)
                    .append("text")
                    .attr('fill', getDarkFill(element))
                    .attr('y', stateAbrY)
                    .attr('x', stateAbrX)
                    .attr('font-size', abrFontSize)
                    .text(ABBR)

                //1.19M
                selectStateG(ABBR)
                    .append("text")
                    .attr('fill', getDarkFill(element))
                    .attr('y', communitySizeY)
                    .attr('x', communitySizeX)
                    .attr('font-size', communityFontSize)
                    .text(nFormatter(communitySize, 2));


                setAtt(ABBR, 'fill', getFill(element));
                setAtt(ABBR, 'class', (element.Legislation === 'Yes' ? 'green-rect' : 'red-rect') + ' rect-stroke');
            });

            //retrieved from https://bl.ocks.org/hrecht/f84012ee860cb4da66331f18d588eee3
            let descriminationData = d;
            //sort bars based on value
            descriminationData = descriminationData.sort(function (state1, state2) {
                return d3.ascending(state1['Percent Incidents'], state2['Percent Incidents']);
            });

            descriminationData.forEach(state => {
                console.log(state['State'], state['Percent Incidents']);
            });

            //set up svg using margin conventions - we'll need plenty of room on the left for labels
            var margin = {
                top: 50,
                right: 50,
                bottom: 15,
                left: 150
            };

            var width = 1000 - margin.left - margin.right,
                height = 2000 - margin.top - margin.bottom;

            var svg = d3.select("#graphic").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            var xFunc = d3.scale.linear()
                .range([0, width])
                .domain([0, 4]);

            var yFunc = d3.scale.ordinal()
                .rangeRoundBands([height, 0], 0)
                .domain(descriminationData.map(function (state) {
                    return state['State'];
                }));

            var yLabelFunc = d3.scale.ordinal()
                .rangeRoundBands([height, 0], .1)
                .domain(descriminationData.map(function (state) {
                    return state['Abr.'] + ', ' + state['State'];
                }));

            //make y axis to show bar names
            var yAxis = d3.svg.axis()
                .scale(yLabelFunc)
                .tickSize(1)
                .orient("left");

            // add the x Axis
            let xAxis = d3.svg.axis()
                .scale(xFunc)
                .tickValues([0, 1, 2, 3, 4, 5])
                .tickSize(20, 1)
                .tickFormat((each) => d3.format(".0%")(each / 100))
                .orient('top')

            svg.append("g")
                .call(xAxis);

            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis)
            svg.selectAll(".tick line").attr("stroke", "black").attr("stroke-dasharray", "2,2");
            var bars = svg.selectAll(".bar")
                .data(descriminationData)
                .enter()
                .append("g")
                .attr('fill', (state) => getFill(state))
                .attr('class', (element) => ((element.Legislation === 'Yes' ? 'green-rect' : 'red-rect') + ' bar-rect-stroke'))

            //append rects
            bars.append("rect")
                .attr("class", "bar")
                .attr("y", function (d) {
                    let yValue = yFunc(d['State']);
                    return yValue;
                })
                .attr("height", yFunc.rangeBand())
                .attr("x", 0)
                .attr("width", function (d) {
                    return xFunc(d['Percent Incidents']);
                })

            //add a value label to the right of each bar
            bars.append("text")
                .attr("class", "label")
                //y position of the label is halfway down the bar
                .attr("y", function (state) {
                    return yFunc(state['State']) + yFunc.rangeBand() / 2 + 4;
                })
                //x position is 3 pixels to the right of the bar
                .attr("x", function (state) {
                    return xFunc(state['Percent Incidents']) + 3;
                })
                .text(function (state) {
                    return float(state['Percent Incidents']).toFixed(2) + '%';
                })
                .attr('fill', 'black');

        })
        // var finalViz = svgPanZoom('#finalViz', {
        //     minZoom: 1,
        //     maxZoom: 10
        // });
    });
};

function getFill(element) {
    // return element.Legislation === 'Yes' ? '#27ae60' : '#c0392b';
    return element.Legislation === 'Yes' ? 'darkgrey' : 'white';
}
function getDarkFill(element) {
    // return element.Legislation === 'Yes' ? '#13552e' : '#4d1812';
    return element.Legislation === 'Yes' ? 'black' : 'black';
}


function handleMouseOverRect(d, i) {
    div.transition()
        .duration(0)
        .style("opacity", 1);
    div.html(d['State'] + '<br>' + nFormatter(d['Community'], 2) + ' people are ' + (d['Legislation'] === 'No' ? 'not legally protected' : 'are legally protected'))
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 28) + "px");
    // if (d && d.Legislation === 'No') {
    //     let filter = 'sofGlowRed';
    //     this && this.setAttribute('filter', 'url(#' + filter + ')');
    // }
}

function handleMouseOutRect(d, i) {
    div.transition()
        .duration(0)
        .style("opacity", 0);
    // this && this.removeAttribute('filter');
}


function pixelToNumber(str) {
    return str ? int(str.split('px')[0]) : 0;
}

function getFontSize(fontScale, domainVal) {
    return fontScale(int(domainVal)) + 'px';
};
function center(ABBR, cord, offset = 0, selfWidth = 0) {
    return int(getAtt(ABBR, cord)) + int(getAtt(ABBR, 'width')) / 2 - selfWidth / 2 + offset;
}
function rightEdge(ABBR, cord, offset = 0) {
    return int(getAtt(ABBR, cord)) + int(getAtt(ABBR, 'width')) + offset;
}
function int(val) {
    return Number.parseInt(val);
}
function float(val) {
    return Number.parseFloat(val);
}

