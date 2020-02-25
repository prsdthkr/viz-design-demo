const typeBreakDown = function (og, newItem) {
    let newTypeItem = newItem['type'];
    if (og[newTypeItem] !== undefined) {
        let ogTypeCount = og[newTypeItem];
        og[newTypeItem] = ogTypeCount + 1;
    }
    else {
        og[newTypeItem] = 1;
    }
    return og;
}

function flatten(mapEntry, flatMap) {
    let sector = mapEntry[0]
    let levels = mapEntry[1]
    let levelsArr = Object.entries(levels)
    levelsArr.forEach(level => {
        flatMap.push({
            sector: sector,
            level: level[0],
            count: level[1]
        })
    })
}

d3.csv("./data/use-of-force.csv")
    .row(function (d) {
        return { sector: d.Sector, type: d.Incident_Type };
    })
    .get(function (error, rows) {
        let heatMap = {};
        rows.forEach(row => {
            // console.log(row)
            let sector = row.sector;
            if (heatMap[sector] !== undefined) {
                let typeCount = heatMap[sector];
                heatMap[sector] = typeBreakDown(heatMap[sector], row);
            } else {
                heatMap[sector] = typeBreakDown({}, row);
            }
        })
        let heatMapArr = Object.entries(heatMap)
        let flatMap = []
        heatMapArr.forEach(entry => {
            flatten(entry, flatMap)
        })
        console.log('flatMap', flatMap)

        // set the dimensions and margins of the graph
        var margin = { top: 30, right: 30, bottom: 30, left: 150 },
            width = 1600 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

        // append the svg object to the body of the page
        var svg = d3.select("#my_dataviz")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        // Labels of row and columns
        var myGroups = ["DAVID", "QUEEN", "NORA", "KING", "", "UNION", "GEORGE", "EDWARD", "CHARLIE", "JOHN", "LINCOLN", "ROBERT", "OCEAN", "SAM", "BOY", "FRANK", "WILLIAM"]
        var myVars = ["Level 1 - Use of Force", "Level 2 - Use of Force", "Level 3 - Use of Force", "Level 3 - OIS"]

        // Build X scales and axis:
        var x = d3.scaleBand()
            .range([0, width])
            .domain(myGroups)
            .padding(0.01);
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))

        // Build X scales and axis:
        var y = d3.scaleBand()
            .range([height, 0])
            .domain(myVars)
            .padding(0.01);
        svg.append("g")
            .call(d3.axisLeft(y));

        { fill: '#e26262' }
        // Build color scale
        var myColor = d3.scaleLinear()
            .range(["#faa1a1", "#e26262"])
            .domain([0, 500])

        //Read the data
        svg.selectAll()
            .data(flatMap, function (d) { return d.sector + ':' + d.level; })
            .enter()
            .append("rect")
            .attr("x", function (d) { return x(d.sector) })
            .attr("y", function (d) { return y(d.level) })
            .attr("width", x.bandwidth())
            .attr("height", y.bandwidth())
            .style("fill", function (d) { return myColor(d.count) })
    });