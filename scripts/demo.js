d3.csv('./data/use-of-force.csv').then(function (data) {

    // ======================
    // Transform data to desired structure for visualization
    // ======================
    let breakDown = {};
    data.forEach(eachItem => {
        let race = eachItem['Subject_Race'];
        if (breakDown[race] !== undefined) {
            let raceCount = breakDown[race];
            breakDown[race] = raceCount + 1;
        }
        else {
            breakDown[race] = 1;
        }
    });

    // ======================
    // Set the scale of your graph
    // https://github.com/d3/d3/blob/master/API.md
    // ======================
    let scale = d3.scaleLinear().domain([105, 6058]).range([0, 600]);

    // ======================
    // Declaratively manipulate the DOM
    // ======================
    d3.select('#demo')
        .selectAll('div')
        .data(Object.entries(breakDown))
        .enter()
        .append('li')
        .html(function (d) {
            return '<span>' + d[0] + "(" + d[1] + ")" + '</span>';
        })
        .style("width", function (d) {
            return scale(d[1]) + 'px';
        })
        .style("background", (d) => 'red')
});
