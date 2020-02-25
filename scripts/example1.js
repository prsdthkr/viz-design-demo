//source: https://bl.ocks.org/ypetya/02e6ce08aea9b10a76917df499e81dc8
//author: https://bl.ocks.org/ypetya

var margin = { top: 20, right: 20, bottom: 30, left: 40 },
    width = 1700 - margin.left - margin.right,
    height = 750 - margin.top - margin.bottom;

var x0 = d3.scaleBand().range([0, width]);

var x1 = d3.scaleBand();

var y = d3.scaleLinear()
    .range([height, 0]);

var xAxis = d3.axisBottom()
    .scale(x0);

var yAxis = d3.axisLeft()
    .scale(y)
    .tickFormat(d3.format(".2s"));

var color = d3.scaleOrdinal().range(
    ["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var yBegin;

var innerColumns = {
    "column1": ["White"],
    "column2": ["Black or African American"],
    "column3": ["Asian"],
    "column4": ["Not Specified"],
    "column5": ["Hispanic or Latino"],
    "column6": ["American Indian/Alaska Native"],
    "column7": ["Nat Hawaiian/Oth Pac Islander"],
}

const typeBreakDown = function (og, newItem) {
    let newItemRace = newItem['Subject_Race'];
    // if (og.total !== undefined) {
    //     og.total = og.total + 1;
    // } else {
    //     og.total = 1;
    // }
    if (og[newItemRace] !== undefined) {
        let ogRaceCount = og[newItemRace];
        og[newItemRace] = ogRaceCount + 1;
    }
    else {
        og[newItemRace] = 1;
    }
    return og;
}

d3.csv("./data/use-of-force.csv").then(
    function (csvData) {
        useOfForceData = csvData;
        let breakDown = {};
        csvData.forEach(eachItem => {
            let type = eachItem['Incident_Type'];
            if (breakDown[type] !== undefined) {
                let typeCount = breakDown[type];
                breakDown[type] = typeBreakDown(breakDown[type], eachItem);
            }
            else {
                breakDown[type] = typeBreakDown({}, eachItem);
            }
        });
        const data = Object.entries(breakDown).map(function (entry) {
            let type = entry[0];
            let payload = entry[1];
            payload.type = type;
            return payload;
        });
        let temp;
        temp = data[1];
        data[1] = data[2];
        data[2] = temp;
        var columnHeaders = d3.keys(data[0]).filter(function (key) { return key !== "type"; });
        color.domain(d3.keys(data[0]).filter(function (key) { return key !== "type"; }));
        data.forEach(function (d) {
            var yColumn = new Array();
            d.columnDetails = columnHeaders.map(function (name) {
                for (ic in innerColumns) {
                    if ($.inArray(name, innerColumns[ic]) >= 0) {
                        if (!yColumn[ic]) {
                            yColumn[ic] = 0;
                        }
                        yBegin = yColumn[ic];
                        yColumn[ic] += +d[name];
                        return { name: name, column: ic, yBegin: yBegin, yEnd: +d[name] + yBegin, };
                    }
                }
            });
            d.total = d3.max(d.columnDetails, function (d) {
                return d.yEnd;
            });
        });

        x0.domain(data.map(function (d) { return d.type; }));
        x1.domain(d3.keys(innerColumns)).range([0, x0.bandwidth()]);

        y.domain([0, d3.max(data, function (d) {
            return d.total;
        })]);

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".7em")
            .style("text-anchor", "end")
            .text("");

        var project_stackedbar = svg.selectAll(".project_stackedbar")
            .data(data)
            .enter().append("g")
            .attr("class", "g")
            .attr("transform", function (d) { return "translate(" + x0(d.type) + ",0)"; })
            .style("margin", (d) => '0 3px');
        
        var tooltip = d3.select("body")
            .append("div")
            .style("position", "absolute")
            .style("z-index", "10")
            .style("visibility", "hidden")

        project_stackedbar.selectAll("rect")
            .data(function (d) { return d.columnDetails; })
            .enter().append("rect")
            .attr("width", x1.bandwidth() - 10)
            .attr("x", function (d) {
                return x1(d.column);
            })
            .attr("y", function (d) {
                return y(d.yEnd);
            })
            .attr("height", function (d) {
                return y(d.yBegin) - y(d.yEnd);
            })
            .style("fill", function (d) {
                return color(d.name);
            })
            .on("mouseover", function (d) {
                return tooltip.style("visibility", "visible").text('Incidents: ' + d.yEnd)
            })
            .on("mousemove", function () { return tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px"); })
            .on("mouseout", function () { return tooltip.style("visibility", "hidden"); });

        var legend = svg.selectAll(".legend")
            .data(columnHeaders.slice().reverse())
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });

        legend.append("rect")
            .attr("x", width - 18)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", color);

        legend.append("text")
            .attr("x", width - 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function (d) { return d; });

    });