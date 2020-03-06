// d3.squareMap.setAttr({
//     colorSet: 'Greys',
//     labelStyle: 'abbr'
// }).render('data/size-of-communities.csv', '.map-container');
// $(window).on("load", function () {

// })

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
    return val;
};

const setAtt = function (ABBR, key, value) {
    if (!ABBR) return;
    selectStateRect(ABBR).attr(key, value);
};

window.onload = function () {
    d3.csv('data/rich-size-of-communities.csv', function (d) {
        d.forEach(element => {
            // console.log(element);
            const ABBR = element['Abr.'];
            const two15 = float(element['2015 charges']);
            const two16 = float(element['2016 charges']);
            const two17 = float(element['2017 charges']);
            const avgRate = (two15 + two16 + two17) * 100 / 3;
            console.log(ABBR, avgRate);
            if (!ABBR) return;
            selectStateG(ABBR)
                .append("text")
                .attr('fill', 'black')
                .attr('y', center(ABBR, 'y'))
                .attr('x', leftEdge(ABBR, 'x', 10))
                .attr('font-size', '20px')
                .text(ABBR)
            selectStateG(ABBR)
                .append("text")
                .attr('fill', 'black')
                .attr('y', center(ABBR, 'y', 20))
                .attr('x', leftEdge(ABBR, 'x', 10))
                .attr('font-size', '12px')
                .text(avgRate.toFixed(2) + '%');


            var greenScale = d3.scale.linear().domain([21, 37])
                .range(["#13532e", "#2ecc71"]);
            var redScale = d3.scale.linear().domain([27, 39])
                .range(["#ffaba2", "#be1c0a"]);
            const colorScale = element.Legislation === 'No' ? redScale : greenScale;
            setAtt(ABBR, 'fill', colorScale(avgRate));
        });
    })
};

function center(ABBR, cord, offset = 0) {
    return int(getAtt(ABBR, cord)) + int(getAtt(ABBR, 'width')) / 2 + offset;
}
function leftEdge(ABBR, cord, offset = 0) {
    return int(getAtt(ABBR, cord)) + int(getAtt(ABBR, 'width')) + offset;
}
function int(val) {
    return Number.parseInt(val);
}
function float(val) {
    return Number.parseFloat(val);
}

