(function() {
	'use strict';
	
	let padding = {
		top: 20,
		right: 20,
		bottom: 20,
		left: 30
	};
	
	let mountNode = document.getElementById("chart");

	let Chart = React.createClass({
		render: function() {
			return (
				<svg width={this.props.width} height={this.props.height}>{this.props.children}</svg>
			);
		}
	});
	
	let Bar = React.createClass({
		getDefaultProps: function() {
			return {
				width: 0,
				height: 0,
				offset: 0
			}
		},
		render: function() {
			return (
				<rect fill={this.props.color}
					  width={this.props.width} 
					  height={this.props.height} 
					  x={this.props.offset} 
					  y={this.props.availableHeight - this.props.height} />
			);
		}
	});
	
	let XAxis = React.createClass({
		componentWillMount() {

			let ticks = 12;
			
			let rwidth = this.props.width - padding.left - padding.right,
				rheight = this.props.height - padding.top - padding.bottom;
			
			this.xScale = d3.scale.ordinal()
								.domain(d3.range(this.props.data.length))
								.rangeRoundBands([0, rwidth], 0.05);

			this.xAxis = d3.svg.axis()
							.scale(this.xScale)
							.orient('bottom')
							.ticks(ticks);
			
		},
		componentDidMount() {
			this.renderAxis();
		},
		componentDidUpdate(){
			this.renderAxis();
		},
		render: function() {
			return (
				<g ref="xAxis" />
			);
		},
		renderAxis() {
			
			d3
				.select(this.refs.xAxis)
				.call(this.xAxis)
				.attr('transform', 'translate(' + [padding.left, this.props.height - 20] + ')')
				.attr('class', 'axis x-axis');
			
		}
	});
	
	let YAxis = React.createClass({
		componentWillMount() {
			
			let ticks = 8;
			
			let rwidth = this.props.width - padding.left - padding.right,
				rheight = this.props.height - padding.top - padding.bottom;
			
			let yScale = d3.scale.linear()
							.domain([d3.max(this.props.data), 0])
							.range([0, rheight]);
			
			this.yAxis = d3.svg.axis()
							.scale(yScale)
							.orient('left')
							.ticks(ticks);
			
		},
		componentDidMount() {
			this.renderAxis();
		},
		componentDidUpdate() {
			this.renderAxis();
		},
		render: function() {
			return (
				<g ref="yAxis" />
			);
		},
		renderAxis() {
			
			d3
				.select(this.refs.yAxis)
				.call(this.yAxis)
				.attr('transform', 'translate(' + [padding.left, padding.top] + ')')
				.attr('class', 'axis y-axis');
			
		}
	});
	
	let DataSeries = React.createClass({
		getDefaultProps: function() {
			return {
				title: '',
				data: []
			}
		},
		componentDidMount() {
			this.renderBars();
		},
		componentDidUpdate(){
			this.renderBars();
		},
		render: function() {
			let props = this.props,
				ticks = 12;

			let rwidth = this.props.width - padding.left - padding.right,
				rheight = this.props.height - padding.top - padding.bottom;
				
			let yScale = d3.scale.linear()
							.domain([0, d3.max(this.props.data)])
							.range([0, rheight]);
							
			let xScale = d3.scale.ordinal()
							.domain(d3.range(this.props.data.length))
							.rangeRoundBands([0, rwidth], 0.05);

			let xAxis = d3.svg.axis()
							.scale(xScale)
							.orient('bottom')
							.ticks(ticks);
							
			let yAxis = d3.svg.axis()
							.scale(yScale)
							.orient('left')
							.ticks(ticks);
			
			let xGrid = d3.svg.axis()
							.scale(yScale)
							.orient('left')
							.ticks(ticks)
							.tickSize(-this.props.width, 0, 0)
							.tickFormat('');
							
			let yGrid = d3.svg.axis()
							.scale(xScale)
							.orient('bottom')
							.ticks(ticks)
							.tickSize(-this.props.height, 0, 0)
							.tickFormat('');
							
			let bars = _.map(this.props.data, function(point, i) {

				return (
					<Bar height={yScale(point)} width={xScale.rangeBand()} offset={xScale(i)} availableHeight={props.height} color={props.color} key={i} />
				);
				
			});
			
			return (
				<g ref="Bars">{bars}</g>
			);
			
		},
		renderBars() {
			
			d3
				.select(this.refs.Bars)
				.attr('transform', 'translate(' + [padding.left, -1 * padding.bottom] + ')');
			
		}
	});
	
	let BarChart = React.createClass({
		getDefaultProps: function() {
			return {
				width: 0,
				height: 0
			}
		},
		render: function() {
			
			return (
				<Chart width={this.props.width} height={this.props.height}>
					<YAxis data={this.props.data} width={this.props.width} height={this.props.height} />
					<XAxis data={this.props.data} width={this.props.width} height={this.props.height} />
					<DataSeries data={this.props.data} width={this.props.width} height={this.props.height} color="cornflowerblue" />
				</Chart>
			);
		}
		
	});
	
	ReactDOM.render(
		<BarChart data={[30, 10, 5, 8, 15, 10]} width={600} height={300} />,
		mountNode
	);
	
}());