(function (d3$1){
  'use strict';
  
  const svg = d3.select('svg');

  const width = +svg.attr('width');
  const height = +svg.attr('height');
  
  var typesel=document.getElementById('axisRange');

  const traits = ['sepal length', 'sepal width', 'petal length', 'petal width'];

  const render = (data) => {
    svg.selectAll("*").remove();
    const title = 'Iris Parallel Coordinate Plot';

    const color = d3.scaleOrdinal()
      .domain(["Iris-virginica", "Iris-versicolor", "Iris-setosa" ])
      .range([ "#E3BA22", "#137B80", "#8E6C8A"]); 

    const margin = { top: 120, right: 150, bottom: 70, left: 100 };
    const innerHeight = height - margin.top - margin.bottom;
    const innerWidth = width - margin.right - margin.left;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    	g.append('text').text('You can drag a label to change the order of the axes!')
        .attr('transform','translate(-80,350)')
        .attr('font-size','1.3em')
        .attr('fill','#635F5D');
    
    const xScale = d3.scalePoint()
      .domain(traits)
      .range([0, innerWidth]);

    var yScale = {}
      for (var i in traits) {
        name = traits[i]
        yScale[name] = d3.scaleLinear()
          .domain([0,8])
          .range([innerHeight, 0])
          .nice();
      }
    
    const colorLegend = d3$1.legendColor()
      .scale(color)
      .shape('circle');
    
    var yAxis = {}
    for (var i in traits) {
      name = traits[i]
      yAxis[name] = d3.axisLeft(yScale[name])
      .tickPadding(10)
      }


    const path = d =>
      d3.line()(traits.map(p => [xScale(p), yScale[p](d[p])]))

    const movingpath = d =>
      d3.line()(traits.map(p => [movingPos(p), yScale[p](d[p])] ));


    const pathG = g.selectAll('path').data(data).enter()
      .append('path')
      .attr('d', path)
      .attr('stroke',  d => {return color(d.class); })
      .attr('fill', 'none')
      .attr('opacity', 0.5)
      .attr('stroke-width', 2);

    const yAxisG = g.selectAll('.domain').data(traits).enter()
      .append('g')
        .each(function(d) { d3.select(this).call(yAxis[d])})
        .attr('transform', d => 'translate(' + xScale(d) +',0)')

    var draging = {};

    const movingPos = d =>{
      if(draging[d] == null){
        return xScale(d);
      }else{
        return draging[d];
      }
    };

    const drag = (d) => {
      draging[d] = Math.min(innerWidth+30, Math.max(-30, d3.event.x));
      traits.sort((p,q) => movingPos(p) - movingPos(q));

      xScale.domain(traits);
      pathG.attr('d', d => movingpath(d));
      yAxisG.attr('transform', d => 'translate(' + movingPos(d) +',0)');
    } 

    const transition = g =>  
      g.transition().duration(300)

    const dragend = d => {
       delete draging[d];
       transition(pathG).attr("d",  d => path(d));
       transition(yAxisG).attr("transform", p => "translate(" + xScale(p) + ",0)"); 
    }

    yAxisG.call(d3.drag()
              .subject(d => { return {x: xScale(d)}; })
              .on('drag', d => drag(d))
              .on('end', d => dragend(d))
    );

    yAxisG.append('text')
        .attr('class', 'axis-label')
        .attr('fill','black')
        .attr('y', -20)
        .attr('text-anchor', 'middle')
        .text(d => d);
    
    const colorLegendG = g.append('g')
          .attr('transform', `translate(${innerWidth+27}, 273)`);
    
    colorLegendG
          .append('text')
    			.attr('class', 'legend-label')
          .attr('x', 9)
          .attr('y', -15)
          .text('classes');
    
    g.append('text')
      .attr('class', 'title')
      .attr('y', -65)
      .attr('x', 68)
      .text(title)
  
    colorLegendG.call(colorLegend)
      .attr('class', 'legend-class')
      .selectAll('.cell text');
  };

  d3.csv('http://vis.lab.djosix.com:2020/data/iris.csv')
    .then( data => {
      data.forEach(d => {
        d['sepal length'] = +d['sepal length'];
        d['sepal width'] = +d['sepal width'];
        d['petalLength'] = +d['petal length'];
        d['petalWidth'] = +d['petal width'];
      });
    	data.pop();
      render(data);
    });
  
}(d3));