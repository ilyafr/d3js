(function() {
	'use strict';
	
	function arcChart() {
		
		var dataArr;
		
		var attributes = {
			'width': 800,
			'height': 600,
			'margin': {
				'top': 20,
				'right': 20,
				'bottom': 20,
				'left': 20
			},
			'delay': 800,
			'ticks': 12,
			'x': function(d) { return d.name; },
			'y': function(d) { return d.value; },
			'xAxisName': 'Название оси X',
			'yAxisName': 'Название оси Y',
			'chartName': 'Название графика',
			'innerRadius': 10,
			'outerRadius': 400,
			'color20': d3.scale.category20(),
			'color10': d3.scale.category10(),
			'color20b': d3.scale.category20b(),
			'color20c': d3.scale.category20c()
		};
		
		function chart(selected) {
			selected.each(function(data){
				var div = d3.select(this),
					svg = div.selectAll('svg').data([data]);
				
				var width = chart.width(),
					height = chart.height(),
					margin = chart.margin(),
					rwidth = width - margin.left - margin.right,
					rheight = height - margin.top - margin.bottom,
					ticks = chart.ticks(),
					innerRadius = chart.innerRadius(),
					outerRadius = chart.outerRadius(),
					delay = chart.delay();
				
				dataArr = data;
				
				svg
					.enter()
					.append('svg')
					.attr('width', width)
					.attr('height', height)
					.call(chart.svgInit);
				
				svg
					.insert('rect', ':first-child')
					.attr('class', 'svg-bg')
					.attr('width', width)
					.attr('height', height);
				
				var xScale = d3.scale.ordinal()
				                .domain(data.map(attributes.x))
								.rangeBands([0, rwidth]);
				
				var yScale = d3.scale.linear()
									.domain([0/*d3.min(data, function(d) { attributes.y(d); })*/, 15/*d3.max(data, function(d) { return attributes.y(d); })*/])
									.range([rheight, 0]);
				
				var cScale = d3.scale.linear()
									.domain([0, d3.max(data, function(d) { return attributes.y(d); })])
									.range([0, 2 * Math.PI]);
				
				var xAxis = d3.svg.axis()
								.scale(xScale)
								.orient('bottom')
								.ticks(ticks);
								
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
				
				var arc = d3.svg.arc()
								.outerRadius(rheight / 4)
								.innerRadius(innerRadius);
				
				var pie = d3.layout.pie()
								.sort(null)
								.value(function(d) { return attributes.y(d); });
				
				svg
					.select('.chart-title')
					.append('text')
					.text(attributes.chartName)
					.attr('transform', 'translate(' + [0, (margin.top / 2)] + ')')
					.style('text-anchor', 'middle');
				
				svg
					.select('.x-axis')
					.call(xAxis)
					.selectAll('text')
					.attr('class', 'x-axis-text')
					.attr('transform', 'translate(' + [-15, 10] + ') rotate(-90)')
					.style('text-anchor', 'end');
					
				svg
					.select('.y-axis')
					.call(yAxis);
				
				svg
					.select('.x-grid')
					.call(xGrid);
				
				svg
					.select('.y-grid')
					.call(yGrid);
				
				// Title y-axis
				svg
					.select('.y-axis-title')
					.append('text')
					.text(attributes.yAxisName)
					.attr('transform', 'translate(' + [-margin.left / 2, rheight / 2] + ') rotate(-90)')
					.style('text-anchor', 'middle');
				
				// ARC-Chart
				var pieSVG = svg
					.select('.chart-arc')
					.selectAll('.arc')
					.data(pie(data))
					.enter()
					.append('g')
					.classed('arc', true);

				pieSVG
					.append('path')
					.attr('d', arc)
					.attr('class', function(d, i) { return 'arc-path arc-path-' + i; } )
					.attr('fill', 
							function(d, i) {
								if(i < 20) {
									return attributes.color20(i);
								} else if(i < 40) {
									return attributes.color20b(i);
								} else {
									return attributes.color10(i);
								}
							}
					);
				
				pieSVG
					.on('mouseenter', function(d, i) {
						
						chart.mouseEnter(d3.select(this), chartInfo, d, i);

					})
					.on('mouseleave', function(d, i) {
						
						chart.mouseLeave(d3.select(this), chartInfo, d, i);
						
					});
				
				var chartInfo = svg.select('.chart-info').append('text').style('text-anchor', 'middle');

				// Rect-Chart
				svg
					.select('.chart-rect')
					.selectAll('rect')
					.data(data)
					.enter()
					.append('rect')
					.attr('class', 'chart-rect')
					.attr('width', 12)
					.attr('height', function(d) { return rheight - yScale(attributes.y(d)); })
					.attr('x', function(d) { return xScale(attributes.x(d)); })
					.attr('y', function(d) { return height - margin.bottom - (rheight - yScale(attributes.y(d))); } )
					.attr('transform', function(d) { return 'translate(' + [2, 0] + ')'; })
					.style('fill', 	function(d, i) {
								if(i < 20) {
									return attributes.color20(i);
								} else if(i < 40) {
									return attributes.color20b(i);
								} else {
									return attributes.color10(i);
								}
							}
						)
					.on('mouseenter', function(d, i) {
						
						chart.mouseEnter(d3.select('.arc-path-' + i), chartInfo, d, i);

					})
					.on('mouseleave', function(d, i) {
						
						chart.mouseLeave(d3.select('.arc-path-' + i), chartInfo, d, i);

					});
				
				svg
					.selectAll('.x-axis-text')
					.on('mouseenter', function(d, i) {
						
						chart.mouseEnter(d3.select('.arc-path-' + i), chartInfo, d, i);

					})
					.on('mouseleave', function(d, i) {
						
						chart.mouseLeave(d3.select('.arc-path-' + i), chartInfo, d, i);

					});
				
			});
		}
		
		chart.mouseEnter = function(element, chartInfo, d, i) {
			var delay = attributes.delay,
				data = dataArr[i];

			element
				.transition()
				.duration(delay / 4)
				.attr('transform', function(d) {
					var a = (d.endAngle + d.startAngle) / 2,
						dist = 40,
						dx = dist * Math.sin(a),
						dy = -1 * dist * Math.cos(a);
					chartInfo
						.text(data.name + ' - ' + data.value + '%');
					return 'translate(' + dx + ',' + dy + ')';
				});
			
		}
		
		chart.mouseLeave = function(element, chartInfo, d, i) {
			var delay = attributes.delay;
			
			element.transition()
				.duration(delay / 4)
				.attr('transform', function(d) {
					//chartInfo
					//	.text('');
					return 'translate(0, 0)';
				});
			
		}
		
		chart.svgInit = function(svg) {
			
			var width = chart.width(),
				height = chart.height(),
				margin = chart.margin(),
				rwidth = width - margin.left - margin.right,
				rheight = height - margin.top - margin.bottom;
			
			// X-Axis Group
			svg
				.append('g')
				.attr('class', 'axis x-axis')
				.attr('transform', 'translate(' + [margin.left, height - margin.bottom] + ')');
				
			// X-Axis-Title Group
			svg
				.append('g')
				.attr('class', 'axis-title x-axis-title')
				.attr('transform', 'translate(' + [margin.left, height - margin.bottom] + ')');
			
			// Y-Axis Group
			svg
				.append('g')
				.attr('class', 'axis y-axis')
				.attr('transform', 'translate(' + [margin.left, margin.top] + ')');
			
			// Y-Axis-Title Group
			svg
				.append('g')
				.attr('class', 'axis-title y-axis-title')
				.attr('transform', 'translate(' + [margin.left, margin.top] + ')');
			
			// X-Grid Group
			svg
				.append('g')
				.attr('class', 'grid x-grid')
				.attr('transform', 'translate(' + [margin.left, margin.top] + ')');
			
			// Y-Grid Group
			svg
				.append('g')
				.attr('class', 'grid y-grid')
				.attr('transform', 'translate(' + [margin.left, height - margin.bottom] + ')')
			
			// Chart-Arc Group
			svg
				.append('g')
				.attr('class', 'chart-arc')
				.attr('transform', 'translate(' + [ margin.left + rwidth / 2, margin.top + rheight / 2] + ')');
				
			// Chart-Info Group
			svg
				.append('g')
				.attr('class', 'chart-info')
				.attr('transform', 'translate(' + [ (margin.left + rwidth / 2) , 2 * margin.top ] + ')');
			
			// Chart-Rect Group
			svg
				.append('g')
				.attr('class', 'chart-rect')
				.attr('transform', 'translate(' + [margin.left, 0] + ')');
				
			// Chart Title
			svg
				.append('g')
				.attr('class', 'chart-title')
				.attr('transform', 'translate(' + [width / 2, margin.top / 6] + ')');
			
		}
		
		function createAccessor(attr) {
			function accessor(value) {
				if(!arguments.length) { return attributes[attr]; }
				attributes[attr] = value;
				return chart;
			}
			return accessor;
		}
		
		for( var attr in attributes) {
			if( !(chart[attr]) && attributes.hasOwnProperty(attr) ) {
				chart[attr] = createAccessor(attr);
			}
		}
		
		return chart;
	}
	
	d3.csv('data/auto_sale_sep2015.csv', function(data) {
		
		var names = d3.keys(data[0]),
			namesLen = names.length,
			dataLen = data.length,
			result = [],
			allAuthos = 0;

		for(var i = 0; i < dataLen; i++) {
			result[i] = result[i] || {};
			var j = 0,
				values = d3.values(data[i]);
				
			for(var j = 0; j < namesLen; j++) {
				if(j == 0) names[j] = 'name';
				if(j == 1) {
					names[j] = 'value';
					allAuthos += +values[j].replace(/\./g, '');
				}
				if(j > 1) continue;
				result[i][names[j]] = values[j].replace(/\./g, '');
			}
		}
		
		for(var i = 0; i < dataLen; i++) {
			result[i]['value'] = Math.round(result[i]['value'] * 10000 / allAuthos) / 100;
		}
		
		console.log(result);
		
		var chart = arcChart()
							.width(800)
							.height(600)
							.innerRadius(15)
							.outerRadius(385)
							.xAxisName(names[0])
							.yAxisName("%")
							.margin({
								'top': 60,
								'right': 40,
								'bottom': 150,
								'left': 60
							})
							.chartName('Мировые продажи автомобилей, сентябрь 2015');
		
		d3
			.select('#chart')
			.data([result])
			.call(chart);
		
	});

}());