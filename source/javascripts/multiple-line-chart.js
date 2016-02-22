function simpleChart() {
	
	var xScale,
		yScale,
		index = 1;
	
	var attributes = {
		'width': 800,
		'height': 600,
		'margin': {
			'top': 20,
			'right': 20,
			'bottom': 20,
			'left': 20
		},
		'min': 10,
		'max': 100,
		'ticks': 12,
		'x': function(d) { return d.time; },
		'y': function(d) { return d.value; },
		'formatY': d3.time.format('%y'),
		'formatM': d3.time.format('%m'),
		'formatD': d3.time.format('%d'),
		'dotSize': 5,
		'color20': d3.scale.category20(),
		'color10': d3.scale.category10(),
		'color20b': d3.scale.category20b(),
		'color10c': d3.scale.category20c(),
		'duration': 1000,
		'ticks': 12,
		'months': ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'],
		'xAxisName': 'День месяца',
		'yAxisName': 'Значение, единицы',
		'chartName': 'Название графика'
	};
	
	function chart(selected) {
		selected.each(function(data) {

			var div = d3.select(this),
				svg = div.selectAll('svg').data([data]),
				len = data.length;

			var width = chart.width(), // Total width
				height = chart.height(), // Total height
				margin = chart.margin(), // Total margin
				rwidth = width - margin.left - margin.top, // Real width
				rheight = height - margin.top - margin.bottom, // Real height
				min = chart.min(),
				max = chart.max()
				duration = chart.duration(),
				ticks = chart.ticks();

			if( typeof xScale == 'undefined' || typeof yScale == 'undefined' ) {
				
				svg
					.enter()
					.append('svg')
					.attr('width', width)
					.attr('height', height)
					.attr('class','svg-chart')
					.call(chart.chartInit);
				
				xScale = d3.time.scale()
									.domain(d3.extent(data, function(d) { return new Date(attributes.x(d)); }))
									.range([0, rwidth]);
									
				yScale = d3.scale.linear()
									.domain([0/*d3.min(data, function(d) { return attributes.y(d); })*/, max/*d3.max(data, function(d) { return attributes.y(d); })*/])
									.range([rheight, 0]);
				
				var xAxis = d3.svg.axis()
									.scale(xScale)
									.orient('bottom')
									.ticks(ticks)
									.tickFormat(function(d) { return attributes.formatD(d) + ' ' + attributes.months[Number(attributes.formatM(d))]/* + ' ' + attributes.formatY(d)*/; });
				
				var yAxis = d3.svg.axis()
									.scale(yScale)
									.orient('left')
									.ticks(ticks);
				
				var xGrid = d3.svg.axis()
								.scale(yScale)
								.orient('left')
								.ticks(ticks)
								.tickSize(-rwidth, 0, 0)
								.tickFormat('');
				
				var yGrid = d3.svg.axis()
								.scale(xScale)
								.orient('bottom')
								.ticks(ticks)
								.tickSize(-rheight, 0, 0)
								.tickFormat('');

				svg
					.select('.chart-title')
					.append('text')
					.text(attributes.chartName)
					.attr('transform', 'translate(' + [0, (margin.top / 2)] + ')')
					.style('text-anchor', 'middle');
								
				// ----------------------------------------------------------------------- //
				
				// Draw x-axis
				svg
					.select('.x-axis')
					.call(xAxis)
					.selectAll('text')
					.attr('transform', 'translate(' + [-15, 36] + ') rotate(-90)');
				
				// Title x-axis
				var xAxisTitle = svg
					.select('.x-axis-title')
					.append('text')
					.text(attributes.xAxisName)
					.attr('transform', 'translate(' + [rwidth / 2, -10] + ')')
					.style('text-anchor', 'middle');
				
				// Grid X-Axis
				svg
					.select('.x-grid')
					.call(xGrid);
				
				// ********************************************************************** //
				
				// Draw y-axis
				svg
					.select('.y-axis')
					.call(yAxis);
				
				// Title y-axis
				svg
					.select('.y-axis-title')
					.append('text')
					.text(attributes.yAxisName)
					.attr('transform', 'translate(' + [20, rheight / 2] + ') rotate(-90)')
					.style('text-anchor', 'middle');
				
				// Grid Y-Axis
				svg
					.select('.y-grid')
					.call(yGrid)
					.select('line');
				
				// ********************************************************************** //
				
			}
			
			// Line Charts
			var line = d3.svg.line()
							.x(function(d) { return xScale(new Date(attributes.x(d))); })
							.y(function(d) { return yScale(attributes.y(d)); })
							.interpolate('cardinal');
			
			var color = attributes.color10(chart.int(15,150));
			
			// Draw linear Chart
			var path = svg
						.select('.chart')
						.append('path')
						.attr('d', line)
						.attr('class', 'line-chart')
						.attr('stroke', color );
			
			// Animated Draw Chart
			var pathLength = path.node().getTotalLength();
			
			path
				.attr("stroke-dasharray", pathLength + " " + pathLength)
				.attr("stroke-dashoffset", pathLength)
				.transition()
				.delay(duration * 2)
				.duration(duration * 4)
				.ease("linear")
				.attr("stroke-dashoffset", 0);
				
			// Append Dot's
			svg
				.select('.chart')
				.selectAll('.circle-' + index)
				.data(data)
				.enter()
				.append('circle')
				.attr('class', 'circle-' + index)
				.attr('cx', function(d) { return xScale(new Date(attributes.x(d))); })
				.attr('cy', function(d) { return yScale(attributes.y(d)); })
				.attr('r', 0)
				.style('fill', color)
				.transition()
				.delay(function(d, i) { return i * (duration * 2 / len); })
				.duration(duration / 2)
				.attr('r', attributes.dotSize);
			
			index += 1;
			
		});
	}
	
	chart.int = function(max, min) {
		return mF(mR() * (max - min)) + min;
	};
	
	chart.chartInit = function(svg) {

		var width = chart.width(), // Total width
			height = chart.height(), // Total height
			margin = chart.margin(), // Total margin
			rwidth = width - margin.left - margin.top, // Real width
			rheight = height - margin.top - margin.bottom; // Real height
		
		// Background SVG
		svg
			.append('rect')
			.attr('class', 'svg-bg')
			.attr('width', width)
			.attr('height', height);
		
		// X-Axis
		svg
			.append('g')
			.attr('class', 'axis x-axis')
			.attr('transform', 'translate(' + [margin.left, (height - margin.bottom)] + ')');
		
		// X-Axis-Name
		svg
			.append('g')
			.attr('class', 'axis-title x-axis-title')
			.attr('transform', 'translate(' + [margin.left, height] + ')');
		
		// X-Axis Grid
		svg
			.append('g')
			.attr('class', 'grid x-grid')
			.attr('transform', 'translate(' + [margin.left, margin.top] + ')');
		
		// Y-Axis
		svg
			.append('g')
			.attr('class', 'axis y-axis')
			.attr('transform', 'translate(' + [margin.left, margin.top] + ')');
		
		// Y-Axis-Name
		svg
			.append('g')
			.attr('class', 'axis-title y-axis-title')
			.attr('transform', 'translate(' + [0, margin.top] + ')');
		
		// Y-Axis Grid
		svg
			.append('g')
			.attr('class', 'grid y-grid')
			.attr('transform', 'translate(' + [margin.left, (height - margin.bottom)] + ')');
		
		// Chart
		svg
			.append('g')
			.attr('class', 'chart')
			.attr('transform', 'translate(' + [margin.left, margin.top] + ')')
			.attr('width', rwidth)
			.attr('height', rheight);
		
		// Chart Title
		svg
			.append('g')
			.attr('class', 'chart-title')
			.attr('transform', 'translate(' + [width / 2, 0] + ')');
		
		
	}
	
	function createAccessor(attr) {
		function accessor(value) {
			if(!arguments.length) { return attributes[attr]; }
			attributes[attr] = value;
			return chart;
		}
		return accessor;
	}
	
	for(var attr in attributes) {
		if(!(chart[attr]) && attributes.hasOwnProperty(attr)) {
			chart[attr] = createAccessor(attr);
		}
	}
	
	return chart;
}


// **********************************Init ****************************************

var data = [],
	graphs = 5, // Numbers of graphs
	len = 8, // Tested values
	min = 15, // Min test value
	max = 385, // Max test value
	duration = 1000,
	mR = Math.random,
	mF = Math.floor,
	now = (new Date()).getTime(),
	oneDay = (new Date('2001-01-02')).getTime() - (new Date('2001-01-01')).getTime();

function customInteger(max, min) {
	return mF(mR() * (max - min)) + min;
}

// Create Demo Data's
for( var i = 0; i < len; i++ ) {
	for( var j = 0; j < graphs; j++ ) {
		data[j] = data[j] || [];
		data[j].push({
			'time': now + i * oneDay,
			'value': customInteger(max, min)
		});
	}
}

var chart = simpleChart()
					.width(800)
					.height(600)
					.min(min)
					.max(max)
					.margin({'top': 60, 'right': 60, 'bottom': 90, 'left': 80})
					.duration(duration)
					.chartName('Линейный мульти-график');

					
for( var j = 0; j < graphs; j++ ) {

	var dur = duration * j * 6;

	var printCharts = function(index) {
		var dataArr = data[index];
		setTimeout(function() {
			d3
				.select('#chart')
				.data([dataArr])
				.call(chart);
		}, dur);
		
	}
	
	printCharts(j);

}
