
var ss= 50
var margins = { top: 50, bottom: 60, left: 60, right: 50 }

var dataOG

fetch('/hils', {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({sampSz: ss})
  })
  .then(function (response) {
      return response.json();
  }).then(function (data) {
    plot_mds_euc(data)
  });


  fetch('/data/all')
  .then(function (response) {
      return response.json();
  }).then(function (dat) {
    dataOG = dat
  });
  

    
var plotInner, xScale, yScale, radScale, color, colorss, tooltip, tooltip2, Tooltiptable


// var format = d3.format(",d");

d3.select("#sampsz").on("input", function() {
    ss = +this.value;
    console.log('---------Inside step functn', ss)
    fetch('/hils', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({sampSz: ss})
      })
      .then(function (response) {
          return response.json();
      }).then(function (data) {
        plot_mds_euc(data)
      });
})



function handleSearch(ev){
    // ev.preventDefault();
    searchHelper(dataOG, ev)
}
function searchHelper(dataOg, ev){

    // debugger;
    ev.preventDefault();
    valOfInput = d3.select("#query").node().value
    console.log('cb: '+ valOfInput);
    

    var res = dataOg.filter(item => item['word_data.words'].toLowerCase() === valOfInput.toLowerCase())
    if(Object.keys(res).length === 0)
        alert(`The word mapping for ${valOfInput} is not present`)
    else{

        // alert(JSON.stringify(res))
        plotInner.selectAll("circles")
        .data(res)
        .enter()
        .append("text")
        // .merge(txt) // get the already existing elements as well
        // .transition() // and apply changes to all of them
        // .duration(1000)
        .text(function(d){ return d['word_data.words']; })
        .attr("x", function(d) { return xScale(+d['word_data.dot.x']); })
        .attr("y", function(d) { return yScale(+d['word_data.dot.y']); })
        .style("fill",  "purple" )
        // .attr("text-overflow", "ellipsis")
        .style("font-size", function(d) { return radScale(+d['word_data.n']); })
        .on("mouseover", function(e, d) {
            d3.select(this)
            .style("fill", "red")
            .style('transition', '0.4s all cubic-bezier(0.5,0.8,0,1.7)')
            .attr("opacity", 1)
            .style('stroke', '#222');
            

            // tooltip.select('img')
            // .attr('src',  "https://picsum.photos/id/163/2000/1333");

            tooltip.select('p')
            .text("Commonly used words are larger and slightly faded in color. Less common words are smaller and darker.")
            .attr('transition', '0.4s transform cubic-bezier(0.5,0.8,0,1.7)')
            .attr("fill", "#FFD700")
            // .html('<u>' + d.key + '</u>' + "<br>" + d.value + " inhabitants")

            // tooltip.select('a').attr('href', d.data.link).text(d.data.name);
            // tooltip.select('span').attr('class', d.data.category).text(d.data.category);
            tooltip2.style("opacity", 1)
            .style('transition', '0.4s all cubic-bezier(0.5,0.8,0,1.7)')

            appendTable(d);

            tooltip.style('visibility', 'visible');

        })
        .on('mousemove', e => tooltip.style('top', `${e.pageY}px`)
                                            .style('left', `${e.pageX + 10}px`))
        .on("mouseout", function(d){

            // tooltip2.style("opacity", 0)
            d3.select(this)
            .style("fill",  function(d) { return colorss(+d['word_data.n']); })
            .style("font-size", function(d) { return radScale(+d['word_data.n']); })
            .style('stroke', 'none')
            .attr("opacity", function(d) { return (1/(+d['word_data.n']))* currMin})
            // .style("fill", function(d) { return color(d.cluster); })
            return tooltip.style('visibility', 'hidden');


            // d3.select(this).style('stroke', 'none');
            //         return tooltip.style('visibility', 'hidden');
        })
        .transition()
        .duration(5000)
        .delay(function (d, i) {
            return i * 20;
        })
    }
}

function plot_mds_euc(mds_euc_data){

    // console.log(width+ ' :width-height:  '+height)
    // mds_euc_data.sort(function(a,b){

    //     if(+a['word_data.n'] > +b['word_data.n'])
    //         return -1;
    //     else
    //         return 1;

    // })
    // mds_euc_data = heapq.nlargest(100, mds_euc_data, key=operator.itemgetter(9))

    // nEle = d3.select("#sampsz").node().value
    // mds_euc_data = mds_euc_data.slice(0, nEle)
    // console.log('no. of eles: '+ nEle)


    
    svg.selectAll('circles').remove()
    svg.selectAll('text').remove()
    d3.select(".tooltip2").selectAll("*").remove()
    d3.select("svg").selectAll("*").remove()



    // if(reset == true){
    //     d3.select(".tooltip2").selectAll("*").remove()
    //     d3.select("svg").selectAll("*").remove()
    // }


    var currMin = d3.min(mds_euc_data, function(d){ return +d['word_data.n'] })

    tooltip = d3.select('.tooltip');

    tooltip2 = d3.select('.tooltip2')
                        .style("opacity", 0)
                        .style("background-color", "white")
                        .style("border", "solid")
                        .style("border-width", "2px")
                        .style("border-radius", "5px")
                        .style("padding", "10px")

    Tooltiptable = tooltip2.append("table")
                // .attr("class", "tableTooltip")
                .attr("width", 700)
                .attr("height", 40)
                // .style("margin-left", 150)

    plotInner = svg
                .attr('width', width+2*margins.left)
                .attr('height', height+70)
                .append('g')
                .attr('id', 'inner-plot')
                .attr('transform', 'translate(' + margins.left + ',' + margins.top + ')')

        xScale = d3.scaleLinear().range ([0, width]),
        yScale = d3.scaleLinear().range ([height, 0]);

    radScale = d3.scaleLinear().range([10, 70])
    .domain([d3.min(mds_euc_data, function(d){ return +d['word_data.n'] }), d3.max(mds_euc_data, function(d){ return +d['word_data.n'] })]);


    colorss = d3.scaleLinear()
            .domain([0, 2, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26])
            .range(["#000","#111","#222", "#333", "#444", "#555", "#666", "#777", "#888", "#999", "#aaa", "#bbb", "#ccc", "#ddd", "#eee"]);
    
    color = d3.scaleOrdinal(d3.schemeCategory10);

    xScale.domain([d3.min(mds_euc_data, function(d){ return +d['word_data.dot.x'] }), d3.max(mds_euc_data, function(d){ return +d['word_data.dot.x'] })]);
    yScale.domain([d3.min(mds_euc_data, function(d){ return +d['word_data.dot.y'] }), d3.max(mds_euc_data, function(d){ return +d['word_data.dot.y'] })]);

    plotInner.append("text")
        .attr("x", width/2 - margins.right - 40)
        .attr("y", 0)
        .attr("font-size", "50px")
        .style("fill", "#CC6600")
        // .attr("opacity","0.4")
        .text("Word Cloud")

    // Add X axis label:
    plotInner.append("text")
        .attr("text-anchor", "end")
        .attr("class", "xlabel")
        .attr("font-size", "25px")
        .attr("x", width + margins.left )
        .attr("y", height + margins.top - 60 )
        .text("Low vs High HILS Score");

        // Add Y axis label:
    plotInner.append("text")
    .attr("text-anchor", "end")
    .attr("class", "ylabel")
    .attr("font-size", "25px")
    .attr("transform", "rotate(-90)")
    .attr("y", -margins.left+50)
    .attr("x",  10 )
    .text("Low vs High SWLS Score");

    var szScale= d3.scaleSqrt().range([10, 50])
    .domain([d3.min(mds_euc_data, function(d){ return +d['word_data.n'] }), d3.max(mds_euc_data, function(d){ return +d['word_data.n'] })]);

    var ticks = szScale.ticks(5).filter(d => d !==0).reverse()
    var circlefill= 'rgb(0,0,0,0.5)'



    var points = plotInner.selectAll("circles")
        .data(mds_euc_data)
        .enter()
        .append("circle")
        // .merge(points) // get the already existing elements as well
        .attr("class", "point")
        .attr("cx", function(d) { return xScale(+d['word_data.dot.x']); })
        .attr("cy", function(d) { return yScale(+d['word_data.dot.y']); })
        .attr("r", "1")
        // .attr("fill", "blue")
        .style("fill", "pink")

        points.exit()
      .remove()


    var txt = plotInner.selectAll("text")
        .data(mds_euc_data)


    txt.enter()
        .append("text")
        // .merge(txt)
        // .transition() // and apply changes to all of them
        // .duration(1000)
        .attr("class","wordText")
        .text(function(d){ return d['word_data.words']; })
        .attr("x", function(d) {  return xScale(+d['word_data.dot.x']); })
        .attr("y", function(d) { return yScale(+d['word_data.dot.y']); })
        // .attr("transform", "rotate(-45)")

        // .attr("transform",  "rotate(30)")
        .style("fill",  function(d) { return color(+d['class']); })
        .attr("opacity", function(d) { return (1/(+d['word_data.n']))* currMin})
        // .attr("text-overflow", "ellipsis")
        .style("font-size", function(d) { return radScale(+d['word_data.n']); })
        .on("mouseover", function(e, d) {
            d3.select(this)
            .style("fill", "red")
            .attr("opacity", 1)

            d3.select(this).style('stroke', '#222');

            // tooltip.select('img')
            // .attr('src',  "https://picsum.photos/id/163/2000/1333");

            tooltip.select('p')
            .text("Commonly used words are larger and slightly faded in color. Less common words are smaller and darker.")
            // .style("color", "#2F4F4F")

            // .html('<u>' + d.key + '</u>' + "<br>" + d.value + " inhabitants")

            // tooltip.select('a').attr('href', d.data.link).text(d.data.name);
            // tooltip.select('span').attr('class', d.data.category).text(d.data.category);
            tooltip2.style("opacity", 1)
            appendTable(d);

            tooltip.style('visibility', 'visible');

        })
        .on('mousemove', e => tooltip.style('top', `${e.pageY}px`)
                                            .style('left', `${e.pageX + 10}px`))
        .on("mouseout", function(d){

            // tooltip2.style("opacity", 0)
            d3.select(this)
            .style("fill",  function(d) { return color(+d['class']); })
            .style("font-size", function(d) { return radScale(+d['word_data.n']); })
            .style('stroke', 'none')
            .attr("opacity", function(d) { return (1/(+d['word_data.n']))* currMin})

            // .style("fill", function(d) { return color(d.cluster); })
            return tooltip.style('visibility', 'hidden');


            // d3.select(this).style('stroke', 'none');
            //         return tooltip.style('visibility', 'hidden');
        })
        // .transition()
        // .duration(5000)
        // .delay(function (d, i) {
        //     return i * 20;
        // })

        txt.transition()
        .duration(1000)

    update_wordEmb(mds_euc_data)

    var groups = plotInner.selectAll('g').data(ticks);
    var grpEnter = groups.enter().append('g')
    
    grpEnter.merge(groups).attr('transform', (d,i)=> `translate(${70},${i*60})`);
    groups.exit().remove();

    grpEnter.append('circle').merge(groups.select('circle'))
    .attr('r', szScale)
    .attr('fill', circlefill)


    grpEnter.append('text').merge(groups.select('text'))
    .text(d =>d)
    .attr('dy', '0.32em')
    .attr("font-size", "17px")
    .attr('x', d=> szScale(d)+15)

    // Add legend label:
    plotInner.append("text")
    .attr("text-anchor", "end")
    .attr("class", "xlabel")
    .attr("font-size", "17px")
    .attr("y", height/2 - 45)
    .attr("x",  110)
    .text("Frequency");
}


function update_wordEmb(data){
    var currMin = d3.min(data, function(d){ return +d['word_data.n'] })

    // radScale = d3.scaleLinear().range([10, 70])
    // .domain([d3.min(data, function(d){ return +d['word_data.n'] }), d3.max(data, function(d){ return +d['word_data.n'] })]);

    // xScale.domain([d3.min(data, function(d){ return +d['word_data.dot.x'] }), d3.max(data, function(d){ return +d['word_data.dot.x'] })]);
    // yScale.domain([d3.min(data, function(d){ return +d['word_data.dot.y'] }), d3.max(data, function(d){ return +d['word_data.dot.y'] })]);
    
    var u = plotInner.selectAll(".wordText")
        .data(data)

        u.enter()
        .append("text")
        .merge(u)
        .transition()
        .duration(1000)
        // .merge(txt)
        // .transition() // and apply changes to all of them
        // .duration(1000)
        .text(function(d){ return d['word_data.words']; })
        .attr("x", function(d) {  return xScale(+d['word_data.dot.x']); })
        .attr("y", function(d) { return yScale(+d['word_data.dot.y']); })
        // .attr("transform", "rotate(-45)")

        // .attr("transform",  "rotate(30)")
        .style("fill",  function(d) { return color(+d['class']); })
        .attr("opacity", function(d) { return (1/(+d['word_data.n']))* currMin})
        // .attr("text-overflow", "ellipsis")
        .style("font-size", function(d) { return radScale(+d['word_data.n']); })

}

var appendTable = function(dat) {

    //     Tooltip
    //   .html('<u>' + dat.key + '</u>' + "<br>" + dat.value + " inhabitants")
    //   .style("left", (d3.mouse(this)[0]+20) + "px")
    //   .style("top", (d3.mouse(this)[1]) + "px")

    // console.log('----------------appendtable: ', dat)


    Tooltiptable.selectAll('tr').remove()

    // console.log(Tooltiptable)

    // Tooltip.selectAll('tr').remove()

    var keys = Object.keys(dat)

    keys.unshift("Features")

    var values = Object.values(dat)
    values.unshift("Values")

    var thead = Tooltiptable.append('thead')
    var	tbody = Tooltiptable.append('tbody')
    thead.append('tr')
            .selectAll('th')
            .data(keys).enter()
            .append('th')
                .text(function (column) { return column; })
                .style("text-anchor", "start")
        // .style("font-size", "35px")



    // thead.selectAll('.tr').attr("text-anchor", "end")
    // .attr("stroke", "lightpink")
    // .attr("font-size", "35px")

    tbody.append('tr')
    .selectAll('td')
    .data(values).enter()
    .append('td')
        .text(function (column) { return column; })
        .style("text-anchor", "start")

    tbody.append('tr')
    .selectAll('td')
    .data(values).enter()
    .append('td')
        .text(function (column) { return column; })
        .style("text-anchor", "start")

    tbody.append('tr')
    .selectAll('td')
    .data(values).enter()
    .append('td')
        .text(function (column) { return column; })
        .style("text-anchor", "start")

    tbody.append('tr')
    .selectAll('td')
    .data(values).enter()
    .append('td')
        .text(function (column) { return column; })
        .style("text-anchor", "start")


}
