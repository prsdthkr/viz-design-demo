let dummyData = [0, 20, 23, 2440, 4124, 121, 404];

d3.select('#chart').selectAll('div').data(dummyData).enter().append('div').text(function (d) { return d });