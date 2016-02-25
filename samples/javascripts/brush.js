(function() {
	
	function brushChart() {
		
		var xScale,
			xScale2,
			yScale,
			yScale2,
			xAxis,
			xAxis2,
			yAxis,
			xGrid,
			yGrid,
			line,
			line2,
			area,
			area2,
			brush,
			focus,
			content,
			mainXZoom,
			chartPosCorrect;
		
		var attributes = {
			'width': 800,
			'height': 800,
			'margin': {
				'top': 20,
				'right': 20,
				'bottom': 20,
				'left': 20
			},
			'margin2': {
				'top': 20,
				'right': 20,
				'bottom': 20,
				'left': 20
			},
			'ticks': 6,
			'delay': 800,
			'dotSize': 5,
			'padding': 0.176,
			'x': function(d) { return d.time; },
			'y': function(d) { return d.value; },
			'timeFormat': d3.time.format("%d-%m"),
			'xAxisName': 'Название оси X',
			'yAxisName': 'Название оси Y',
			'chartName': 'Название графика',
			'color20': d3.scale.category20(),
			'color10': d3.scale.category10(),
			'color20b': d3.scale.category20b(),
			'color10c': d3.scale.category20c(),
		};
		
		function chart(selected) {
			selected.each(function(data) {
				var div = d3.select(this),
					svg = div.selectAll('svg').data([data]);
				
				var width = chart.width(),
					height = chart.height(),
					margin = chart.margin(),
					margin2 = chart.margin2(),
					rwidth = width - margin.left - margin.right,
					rheight = height - margin.top - margin.bottom,
					rheight2 = margin.bottom - margin2.top - 3 * margin2.bottom,
					x = chart.x(),
					y = chart.y(),
					ticks = chart.ticks()
					timeFormat = chart.timeFormat(),
					delay = chart.delay()
					dotSize = chart.dotSize(),
					padding = chart.padding();
				
				var easing = d3.ease('cubic'),
					
					extentY = d3.extent(data, function(d) { return y(d); }),
					yMin = extentY[0],
					yMax = extentY[1],
					
					extentX = d3.extent(data, function(d) { return x(d); }),
					xMin = extentX[0],
					xMax = extentX[1];
				
				var color = attributes.color20b(chart.int(5, 10));
				
				svg
					.enter()
					.append('svg')
					.attr('class', 'svg')
					.attr('width', width)
					.attr('height', height)
					.call(chart.svgInit);

				xScale = d3.scale.ordinal()
									.domain( data.map(function(d) { return new Date(x(d)); }) )
									.rangeRoundBands([0, rwidth],padding);
				
				yScale = d3.scale.linear()
										.domain( extentY )
										.range([rheight, 0]);
				
				xScale2 = d3.scale.ordinal()
									.domain( data.map(function(d) { return new Date(x(d)); }) )
									.rangeRoundBands([0, rwidth],padding);
				
				yScale2 = d3.scale.linear()
										.domain( extentY )
										.range([rheight2, 0]);
				
				mainXZoom = d3.scale.linear()
										.range([0, rwidth])
										.domain([0, rwidth]);
				
				xAxis = d3.svg.axis()
									.scale(xScale)
									.orient('bottom')
									.ticks(ticks)
									.tickFormat(timeFormat);
				
				xAxis2 = d3.svg.axis()
									.scale(xScale)
									.orient('bottom')
									.ticks(ticks)
									.tickFormat('');
				
				yAxis = d3.svg.axis()
									.scale(yScale)
									.orient('left')
									.ticks(ticks);
									
				xGrid = d3.svg.axis()
									.scale(xScale)
									.orient('bottom')
									.ticks(ticks)
									.tickSize(-rheight, 0, 0)
									.tickFormat('');
									
				yGrid = d3.svg.axis()
									.scale(yScale)
									.orient('left')
									.ticks(ticks)
									.tickSize(-rwidth, 0, 0)
									.tickFormat('');
				
				line = d3.svg.line()
								.x( function(d) { return xScale(new Date(x(d))); } )
								.y( function(d) { return yScale(y(d)); } )
								.interpolate('cardinal');
								
				line2 = d3.svg.line()
								.x( function(d) { return xScale2(new Date(x(d))); } )
								.y( function(d) { return yScale2(y(d)); } )
								.interpolate('cardinal');
				
				area = d3.svg.area()
								.x( function(d) { return xScale(new Date(x(d))); } )
								.y0( rheight )
								.y1( function(d) { return yScale(y(d)); } )
								.interpolate('cardinal');
				
				area2 = d3.svg.area()
								.x( function(d) { return xScale2(new Date(x(d))); } )
								.y0( rheight2 )
								.y1( function(d) { return yScale2(y(d)); } )
								.interpolate('cardinal');
				
				brush = d3.svg.brush()
									.x(xScale2)
									.on('brush', chart.brushed)
									.extent([0, rwidth]);
				
				// ----------------------------------------------------------- //
				
				// Title x-axis
				svg
					.select('.x-axis-title')
					.append('text')
					.text(attributes.xAxisName)
					.attr('transform', 'translate(' + [0, -margin.bottom / 14] + ')') 
					.style('text-anchor', 'middle');
				
				// Title y-axis
				svg
					.select('.y-axis-title')
					.append('text')
					.text(attributes.yAxisName)
					.attr('transform', 'translate(' + [margin.left / 3, rheight / 2] + ') rotate(-90)')
					.style('text-anchor', 'middle');
				
				// Chart Title
				svg
					.select('.chart-title')
					.append('text')
					.text(attributes.chartName)
					.attr('transform', 'translate(' + [0, (margin.top / 2)] + ')')
					.style('text-anchor', 'middle'); 
				
				// ----------------------------------------------------------- //
				
				// Parse X-Axis
				var xAxisTxt = svg
					.select('.x-axis')
					.call(xAxis)
					.selectAll('text');
				var xAxisTxtLen = xAxisTxt.size();

				// Parse Y-Axis
				var yAxisTxt = svg
					.select('.y-axis')
					.call(yAxis)
					.selectAll('text');
				var yAxisTxtLen = yAxisTxt.size();
				
				var xDelay = (xAxisTxtLen > yAxisTxtLen)? delay * yAxisTxtLen / xAxisTxtLen : delay,
					yDelay = (yAxisTxtLen > xAxisTxtLen)? delay * xAxisTxtLen / yAxisTxtLen : delay,
					speedXDuration = function(d, i) { return xDelay * 2 * (i + 1) / ( 3 * (i + 1) )},
					speedXDelay = function(d, i) { return i * xDelay / 4},
					speedYDuration = function(d, i) { return yDelay * 2 * (i + 1) / ( 3 * (i + 1) )},
					speedYDelay = function(d, i) { return i * yDelay / 4};
				
				xAxisTxt
					.attr('transform', 'translate(' + [-20, (margin.bottom + 20)] + ') rotate(0)')
					.transition()
					.duration(speedXDuration)
					.delay(speedXDelay)
					.attr('transform', 'translate(' + [-20, 20] + ') rotate(-45)');
				
				yAxisTxt
					.attr('transform', 'translate(' + [-margin.left, 0] + ')')
					.transition()
					.duration(speedYDuration)
					.delay(speedYDelay)
					.attr('transform', 'translate(' + [0, 0] + ')');
				
				// Parse X-Grid
				var xGridLine = svg
					.select('.x-grid')
					.call(xGrid)
					.selectAll('line');
				
				// Parse Y-Grid
				var yGridLine = svg
					.select('.y-grid')
					.call(yGrid)
					.selectAll('line');

				xGridLine
					.attr('y2', 0)
					.transition()
					.duration(speedXDuration)
					.delay(speedXDelay)					

					.attr('y2', -rheight);
				
				yGridLine
					.attr('x2', 0)
					.transition()
					.duration(speedYDuration)
					.delay(speedYDelay)
					.attr('x2', rwidth); 
				
				// Correct position RangeBand Chart
				chartPosCorrect = Math.ceil(( xScale(new Date(x(data[1]))) - xScale(new Date(x(data[0]))) ) / 2);
				chartPosCorrect = chartPosCorrect - chartPosCorrect * padding;
				
				// Draw Chart Line
				var linePath = svg
					.select('g.line-chart')
					.append('path')
					.attr('transform', 'translate(' + [xScale.rangeBand() / 2, 0] + ')');
				
				setTimeout(function() {
					linePath
						.attr('d', line(data))
						.attr('class', 'line-chart')
						.style('stroke', color );
				
				
					// Animated Draw Line Chart
					var pathLength = linePath.node().getTotalLength();
					
					linePath
						.attr("stroke-dasharray", pathLength + " " + pathLength)
						.attr("stroke-dashoffset", pathLength)
						.transition()
						.duration(delay * 2)
						.ease("linear")
						.attr("stroke-dashoffset", 0);
				}, delay * 2);
				
				// Draw Chart Area
				var startData = data.map( function( datum ) {
					return {
						time  : x(datum),
						value : yMin
					};
				});
				setTimeout(function() {
					svg
						.select('.area-chart')
						.append('path')
						.attr('transform', 'translate(' + [xScale.rangeBand() / 2, 0] + ')')
						.datum(data)
						.attr('d', area)
						.attr('class', 'area-chart')
						.style('fill', chart.hexToRgba( color ))
						.style('fill-opacity', 0.85 )
						.transition()
						// set duration of transition
						.duration( delay )
						// define tween for attribute 'd'
						.attrTween('d', function() {
							// create interpolator which will
							// be able to handle `current normalized time`
							var interpolator = d3.interpolateArray( startData, data );
							// function called several times
							// with values from 0.0 to 1.0
							return function( t ) {
								// calculate needed values to
								// represent 'area' path with interpolated Array
								// return it to set it directly to attribute 'd'
								return area( interpolator( t ) );
							}
						});
				}, delay * 4);
				
				// Draw Chart Dot's
				setTimeout(function() {

					svg
						.select('.rect-chart')
						.selectAll('rect')
						.data(data)
						.enter()
						.append('rect')
						.attr('class', 'rect-chart')
						.attr('width', xScale.rangeBand())
						.attr('y', rheight)
						.attr('height', 0)
						.style('stroke', 	function(d, i) { return chart.hexToRgba(attributes.color20(i)); })
						.style('fill', 	function(d, i) { return attributes.color20(i); })
						.style('fill-opacity', 0.4)
						
						.transition()
						.duration(speedYDuration)
						.delay(speedYDelay)
						
						.attr('height', function(d) { return rheight - yScale(y(d)); })
						.attr('x', function(d) { return xScale(new Date(x(d))); })
						.attr('y', function(d) { return yScale(attributes.y(d)); } ); 

				}, delay * 7);

				// Draw Chart Dot's
				setTimeout(function() {
					
					svg
						.select('.chart')
						.selectAll('circle')
						.data(data)
						.enter()
						.append('circle')
						.attr('class', 'dot')
						.attr('transform', 'translate(' + [xScale.rangeBand() / 2, 0] + ')')
						.transition()
						.duration(delay * 5) 
						.delay(speedXDelay)
						.attr('cx', function(d) { return xScale(new Date(x(d))); })
						.attr('cy', function(d) { return yScale(attributes.y(d)); })
						.attr('r', dotSize)
						.style('fill', color );
					
				}, delay * 5);
				
				//--------------------------[Brushes Chart]------------------------------//
				
				// Draw Brushes Chart
				
				// Draw Chart Line
				var linePath2 = svg
					.select('g.line-chart2')
					.append('path')
					.attr('transform', 'translate(' + [chartPosCorrect, 0] + ')');

				// Draw Chart Area
				var startData = data.map( function( datum ) {
					
					return {
						time  : x(datum),
						value : yMin
					};
					
				});

				setTimeout(function() {
					
					svg
						.select('.x-axis2')
						.call(xAxis2);
					
					linePath2
						.attr('d', line2(data))
						.attr('class', 'line-chart')
						.style('stroke', color );
				
				
					// Animated Draw Line Chart
					var pathLength = linePath2.node().getTotalLength();
					
					linePath2
						.attr("stroke-dasharray", pathLength + " " + pathLength)
						.attr("stroke-dashoffset", pathLength)
						.transition()
						.duration(delay * 2)
						.ease("linear")
						.attr("stroke-dashoffset", 0);
					
					svg
						.select('.area-chart2')
						.append('path')
						.attr('transform', 'translate(' + [chartPosCorrect, 0] + ')')
						.datum(data)
						.attr('d', area2)
						.attr('class', 'area-chart')
						.style('fill', chart.hexToRgba( color ))
						.style('fill-opacity', 0.85 )
						.transition()
						// set duration of transition
						.duration( delay )
						// define tween for attribute 'd'
						.attrTween('d', function() {
							// create interpolator which will
							// be able to handle `current normalized time`
							var interpolator = d3.interpolateArray( startData, data );
							// function called several times
							// with values from 0.0 to 1.0
							return function( t ) {
								// calculate needed values to
								// represent 'area' path with interpolated Array
								// return it to set it directly to attribute 'd'
								return area2( interpolator( t ) );
							}
						});
					
					svg
						.select('.x-brush')
						.call(brush)
						.selectAll("rect")
						.attr("y", -margin2.top)
						.attr("height", rheight2 + margin2.top);

					
				}, delay * 9);
			});
		}
		
		chart.brushed = function() {
			
			// xScale.domain(brush.empty()? xScale2.domain() : brush.extent());
			var x = chart.x(),
				y = chart.y()
				margin = chart.margin();
			var originalRange = mainXZoom.range();
			mainXZoom.domain( brush.empty() ? originalRange : brush.extent() );

			xScale.rangeRoundBands( [
				mainXZoom(originalRange[0]),
				mainXZoom(originalRange[1])
			], 0.2);
			
			focus
				.select(".area-chart path")
				.attr("d", area)
				.attr('transform', 'translate(' + [xScale.rangeBand() / 2, 0] + ')');
			
			var linePath = focus
				.select(".line-chart path")
				.attr("d", line)
				.attr('transform', 'translate(' + [xScale.rangeBand() / 2, 0] + ')');
		
			// Animated Draw Line Chart
			var pathLength = linePath.node().getTotalLength();
			
			linePath
				.attr("stroke-dasharray", pathLength + " " + pathLength)
				.attr("stroke-dashoffset", pathLength)
				.transition()
				.duration(delay / 2)
				.ease("linear")
				.attr("stroke-dashoffset", 0);
			
			focus
				.selectAll(".rect-chart")
				.attr("width", xScale.rangeBand())
				.attr("x", function(d) { return xScale(new Date(x(d))); });
			
			focus
				.selectAll(".dot")
				.attr('cx', function(d) { return xScale(new Date(x(d))); })
				.attr('transform', 'translate(' + [xScale.rangeBand() / 2, 0] + ')');
				
			focus
				.select(".x-axis")
				.call(xAxis);

		}
		
		// Convert Color Function from HEX to RGBA
		chart.hexToRgba = function(color) {

			var R = hexToR(color);
			var G = hexToG(color);
			var B = hexToB(color);

			function hexToR(h) {return parseInt((cutHex(h)).substring(0,2),16)}
			function hexToG(h) {return parseInt((cutHex(h)).substring(2,4),16)}
			function hexToB(h) {return parseInt((cutHex(h)).substring(4,6),16)}
			function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}
			
			return 'rgba(' + R + ',' + G + ',' + B + ',0.75)';
			
		}
		
		// Random Int
		chart.int = function(min, max) {
			return Math.floor(Math.random() * (min + max)) + min;
		}
		
		// Init SVG shapes
		chart.svgInit = function(svg) {
			
			var width = chart.width(),
				height = chart.height(),
				margin = chart.margin(),
				margin2 = chart.margin2(),
				rwidth = width - margin.left - margin.right,
				rheight = height - margin.top - margin.bottom,
				rheight2 = margin.bottom - margin2.top - margin2.bottom;
			
			// X-Axis-Title Group
			svg
				.append('g')
				.attr('class', 'axis-title x-axis-title')
				.attr('transform', 'translate(' + [width / 2, height] + ')');

			// Y-Axis-Title Group
			svg
				.append('g')
				.attr('class', 'axis-title y-axis-title')
				.attr('transform', 'translate(' + [0, margin.top] + ')');

			// Chart Title
			svg
				.append('g')
				.attr('class', 'chart-title')
				.attr('transform', 'translate(' + [width / 2, margin.top / 6] + ')');
			
			// Chart BG
			svg
				.append('rect')
				.attr('class', 'svg-bg')
				.attr('width', width)
				.attr('height', height);
			
			// Group FOCUS
			focus = svg
				.append('g')
				.attr('class', 'focus')
				.attr('transform', 'translate(' + [0, 0] + ')');
			
			// Group CONTEXT
			content = svg
				.append('g')
				.attr('class', 'content')
				.attr('transform', 'translate(' + [0, height - margin.bottom + margin2.top] + ')');
			
			// Chart X-Axis
			focus
				.append('g')
				.attr('class', 'axis x-axis')
				.attr('transform', 'translate(' + [margin.left, (height - margin.bottom)] + ')');

			// Chart Y-Axis
			focus
				.append('g')
				.attr('class', 'axis y-axis')
				.attr('transform', 'translate(' + [margin.left, margin.top] + ')');
				
			// Chart X-Grid
			focus
				.append('g')
				.attr('class', 'grid x-grid')
				.attr('transform', 'translate(' + [margin.left, (height - margin.bottom)] + ')');
			
			// Chart Y-Grid
			focus
				.append('g')
				.attr('class', 'grid y-grid')
				.attr('transform', 'translate(' + [margin.left, margin.top] + ')');
				
			// Line-Chart
			focus
				.append('g')
				.attr('class', 'chart line-chart')
				.attr('transform', 'translate(' + [margin.left, margin.top] + ')');
			
			// Area-Chart
			focus
				.append('g')
				.attr('class', 'chart area-chart')
				.attr('transform', 'translate(' + [margin.left, margin.top] + ')');
			
			// Rect-Chart
			focus
				.append('g')
				.attr('class', 'chart rect-chart')
				.attr('transform', 'translate(' + [margin.left, margin.top] + ')');
			
			//------------------------------[Brush Chart]--------------------------------//
			
			// Chart X-Axis
			content
				.append('g')
				.attr('class', 'axis x-axis2')
				.attr('transform', 'translate(' + [margin.left, (rheight2 - margin2.bottom)] + ')');
			
			// Line-Chart
			content
				.append('g')
				.attr('class', 'chart line-chart2')
				.attr('transform', 'translate(' + [margin.left, margin2.top] + ')');
			
			// Area-Chart
			content
				.append('g')
				.attr('class', 'chart area-chart2')
				.attr('transform', 'translate(' + [margin.left, margin2.top] + ')');
			
			content
				.append('g')
				.attr('class', 'brush x-brush')
				.attr('transform', 'translate(' + [margin.left, margin2.top] + ')');
			
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
	
	// Create Sample Data's
	var data = [],
		elms = 8,
		min = 5,
		max = 400,
		mR = Math.random,
		mF = Math.floor,
		now = (new Date()).getTime(),
		day = (new Date('01-02-2001')).getTime() - (new Date('01-01-2001')).getTime();

	function randInt(min, max) {
		return mF(mR() * (min + max)) + min;
	}

	for(var i = 0; i < elms; i++) {
		data.push({
			'time': now + i * day,
			'value': randInt(min, max)
		});
	}

	var chart = brushChart()
						.width(680)
						.height(680)
						.margin({
							'top': 60,
							'right': 40,
							'bottom': 180,
							'left': 70
						});

	d3
		.select('#chart')
		.data([data])
		.call(chart);
	
}());