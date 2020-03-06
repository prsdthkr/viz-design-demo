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

window.onload = function () {
    d3.csv('data/rich-size-of-communities.csv', function (d) {
        d.forEach(element => {
            // console.log(element);
            const ABBR = element['Abr.'];
            const communitySize = element['Community'];
            const two15 = float(element['2015 charges']);
            const two16 = float(element['2016 charges']);
            const two17 = float(element['2017 charges']);
            const avgRate = (two15 + two16 + two17) * 100 / 3;
            if (!ABBR) return;
            selectStateG(ABBR)
                .append("text")
                .attr('fill', 'black')
                .attr('y', center(ABBR, 'y'))
                .attr('x', rightEdge(ABBR, 'x', 10))
                .attr('font-size', '20px')
                .text(ABBR)

            const tileWidth = getAtt(ABBR, 'width');
            console.log(ABBR, tileWidth);

            //render outside
            let communitySizeY = center(ABBR, 'y', 15);
            let communitySizeX = rightEdge(ABBR, 'x', 10);
            let communityFontSize = '12px';

            //render inside
            var fontScale = d3.scale.linear().domain([1194000, 131000])
                .range([80, 12]);
            const leftPadding = 5;
            if (int(tileWidth) >= 28 + leftPadding) {
                communityFontSize = getFontSize(fontScale, communitySize);
                const fontOffset = fontScale(int(communitySize));
                communitySizeY = int(getAtt(ABBR, 'y')) + fontOffset;
                communitySizeX = int(getAtt(ABBR, 'x')) + leftPadding;
            }

            selectStateG(ABBR)
                .append("text")
                .attr('fill', 'black')
                .attr('y', communitySizeY)
                .attr('x', communitySizeX)
                .attr('font-size', communityFontSize)
                .text(nFormatter(communitySize, 2));

            selectStateG(ABBR)
                .append("text")
                .attr('fill', 'black')
                .attr('y', center(ABBR, 'y', 30))
                .attr('x', rightEdge(ABBR, 'x', 10))
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

