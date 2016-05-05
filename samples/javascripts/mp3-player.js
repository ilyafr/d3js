(function() {
	'use strict';

	/* ********** [Chart Data] ********** */
	var	audioDuration = 0,
		context,
		analyser,
		width = 800,
		height = 460,
		margin = {
			top: 20,
			right: 22,
			bottom: 80,
			left: 22
		},
		rwidth = width - margin.left - margin.right,
		rheight = height - margin.top - margin.bottom;
	
	// Init chart	
	var chart = chartMP3()
					.width(width)
					.height(height)
					.margin(margin);
	
	// Parse chart
	var printChart = d3.select('#chart'),
		audio,
		audioDuration = 0,
		prevSongURL,
		timeValue = 0,
		data = data,
		mC = Math.ceil,
		mR = Math.round,
		mF = Math.floor;
	
	d3.select('#mp3-file').on('change', function(event) {

		var song = this.value,
			isMp3 = song.substr(song.length - 4),
			playerTimer,
			songURL = URL.createObjectURL(this.files[0]);
			
		if(isMp3 == '.mp3') {

			audio = (prevSongURL != songURL && !!prevSongURL)? audio : new Audio();
				audio.src = songURL;
				audio.controls = true;
				audio.autoplay = true;
				audio.loop = true;
				
				// [Refresh time counter]
				audio.addEventListener('timeupdate', function(e) {
					var currTime = audio.currentTime,
						currMin = parseInt(currTime / 60),
						currSec = parseInt(currTime % 60);
					
					currMin = (currMin < 10)? '0' + currMin: currMin;
					currSec = (currSec < 10)? '0' + currSec: currSec;
					
					playerTimer = playerTimer? playerTimer : document.getElementById('player-timer') ;
					
					playerTimer.textContent = currMin + ':' + currSec;

					if(audioDuration > 0) {
						timeValue = 100 * currTime / audioDuration;
					} else {
						audioDuration = audio.duration;
					}
				}, false);

				// jsAudio.appendChild(audio);
			
			activateAudioContext();
			
		} else {
			
			alert('You are played not MP3-file');
			
		}
		prevSongURL = songURL;
	});
	
	function activateAudioContext() {
		
		setTimeout(function (){
			try {
				window.AudioContext = window.AudioContext||window.webkitAudioContext;
				if(!context) {
					context = new AudioContext();
					analyser = context.createAnalyser();
					analyser.fftSize = 2048;
				}
			}
			catch(e) {
				// alert('Opps.. Your browser do not support audio API');
			}
			var source = context.createMediaElementSource(audio);
			source.connect(analyser);
			analyser.connect(context.destination);
			audioDuration = audio.duration;
			rafCallback();
		}, 0);
		
	}

	function rafCallback() {
		var bufferLength = analyser.frequencyBinCount;
		var freqByteData = new Uint8Array(bufferLength);
		
		analyser.getByteFrequencyData(freqByteData);

		var data = [];
		for (var i = 0; i < analyser.frequencyBinCount; i++) {
			if(i % 19 == 0) {
				var value = freqByteData[i];
				var percent = value / 256;
				data.push({'x': i, 'y': percent, 'time': timeValue});
			}
		}
		printChart.data([data]).call(chart);
		window.requestAnimationFrame(rafCallback);
	}

	
	/* ********** [Create Chart Functions] ********** */
	function chartMP3() {
		
		var xScale,
			yScale,
			cScale,
			tScale,
			activate = false,
			width = 0,
			height = 0,
			margin = 0,
			rwidth = 0,
			rheight = 0,
			svgChart,
			timeCircle,
			div,
			svg;

		var attributes = {
			'width': 800,
			'height': 600,
			'margin': {
				'top': 20,
				'right': 20,
				'bottom': 20,
				'left': 20
			},
			'x': function(d) { return d.x; },
			'y': function(d) { return d.y; },
			'time': function(d) { return d.time; },
			'color20b': d3.scale.category20b()
		};
		
		function chart(selected) {
			selected.each(function(data) {
				if(data == null) return;

				if(!activate) {
					div = d3.select(this);
					svg = div.selectAll('svg').data([data]);

					width = chart.width();
					height = chart.height();
					margin = chart.margin();
					rwidth = width - margin.left - margin.right;
					rheight = height - margin.top - margin.bottom;
					
					svg
						.enter()
						.append('svg')
						.attr('width', width)
						.attr('height', height);
					
					svg
						.call(chart.svgInit);
					
					yScale = d3.scale.linear()
											.domain([0, 1])
											.range([rheight, 0]);
					
					xScale = d3.scale.ordinal()
									.domain(data.map(attributes.x))
									.rangeBands([0, rwidth]);

					cScale = d3.scale.linear()
									.range(["blue", "red"])
									.domain([0, rwidth]);

					svgChart = svg
								.select('.player-chart');

					timeCircle = svg
								.select('.player-direct-circle');
					
					tScale = d3.scale.linear()
									.domain([0, 100])
									.range([0, rwidth]);					
					
				}

				var equilizer = svgChart
									.selectAll('rect')
									.data(data);

				if(!activate) {
					
					equilizer.enter()
							.append('rect')
							//.attr('class', 'equilizer')
							.attr('width', xScale.rangeBand())
							.attr('height', function(d) { return rheight - yScale(d.y);})
							.attr('x', function(d, i) { return xScale(d.x); })
							.attr('y', function(d) { return height - margin.bottom - (rheight - yScale(d.y)); })
							.attr('fill', function(d, i) { return cScale(d.x); });
					
				} else {
					
					equilizer
							.attr('height', function(d) { return rheight - yScale(d.y);})
							.attr('y', function(d) { return height - margin.bottom - (rheight - yScale(d.y)); });
					
				}
				
				equilizer.exit().remove();

				timeCircle.transition().attr('cx', tScale(data[0].time) ); 
				
				activate = true;
			});
		}
		
		chart.svgInit =  function(svg) {
			
			var width = chart.width(),
				height = chart.height(),
				margin = chart.margin(),
				rwidth = width - margin.left - margin.right,
				rheight = height - margin.top - margin.bottom;
			
			// SVG background
			svg
				.append('rect')
				.attr('class', 'svg-bg')
				.attr('width', width)
				.attr('height', height);
			
			// X-Axis
			svg
				.append('g')
				.attr('class', 'axis x-axis');
			
			// SVG graph
			svg
				.append('g')
				.attr('class', 'player-chart')
				.attr('transform', 'translate(' + [margin.left, 0] + ')');
				
			// *********** [SVG mp3-direct] ***********
			var direct = svg
							.append('g')
							.attr('class', 'player-direct')
							.attr('transform', 'translate(' + [margin.left, height - margin.bottom] + ')');
			
			direct
				.append('line')
				.attr('x1', 0)
				.attr('y1', 0)
				.attr('x2', rwidth)
				.attr('y2', 0)
				.attr('class', 'player-direct-line');
				
			direct
				.append('circle')
				.attr('cx', 0)
				.attr('cy', 0)
				.attr('r', 6)
				.attr('class', 'player-direct-circle');
			
			var playBtn = svg
							.append('g')
							.attr('class', 'player-btn player-play-btn')
							.attr('transform', 'translate(' + [margin.left, height - margin.bottom] + ')');
			
			var ftoggl = true;
			
			playBtn.on('click', function() {
				playBtn.classed('pause', ftoggl);
				if(ftoggl) {
					audio.pause();
				} else {
					audio.play();
				}
				ftoggl = !ftoggl;
			});
			
			var rSize = margin.bottom / 2;
			var poly = [
						{
							"x": rSize / (3 * 3),
							"y": rSize / 3
						},
						{
							"x": rSize / 3,
							"y": rSize / 2
						},
						{
							"x": rSize / (3 * 3),
							"y": rSize * 2 / 3
						}
					];
						
			var frameBtn = playBtn
							.append('circle')
							.attr('class', 'player-btn-frame')
							.attr('cx', margin.bottom / 4)
							.attr('cy', margin.bottom / 2)
							.attr('r', rSize / 2);
			
			playBtn
				.selectAll('polygon')
				.data([poly])
				.enter()
				.append('polygon')
				.attr('transform', 'translate(' + [rSize / 3, rSize / 2] + ')')
				.attr('points', function(d) {
					return d.map(function(d) {
						return [d.x, d.y].join(",");
					}).join(" ");
				})
				.attr('class', 'player-btn-polygon')
				.attr("stroke","black")
				.attr("stroke-width",2);
			
			
			var pause = playBtn
							.append('g')
							.attr('class', 'player-pause-group')
							.attr('transform', 'translate(' + [0, rSize / 2] + ')');
			
			pause
				.append('rect')
				.attr('class', 'player-pause-bg')
				.attr('width', rSize / 8)
				.attr('height', rSize / 2)
				.attr('transform', 'translate(' + [rSize / 2 - rSize / 6, rSize / 4] + ')');
			
			pause
				.append('rect')
				.attr('class', 'player-pause-bg')
				.attr('width', rSize / 8)
				.attr('height', rSize / 2)
				.attr('transform', 'translate(' + [rSize / 2 + rSize / 18, rSize / 4] + ')');
			
			svg
				.append('g')
				.attr('class', 'player-timer player-timer-data')
				.attr('transform', 'translate(' + [width - margin.right * 2.5, height - margin.bottom * 2 / 3] + ')')
				.append('text')
				.attr('id', 'player-timer')
				.text('00:00');
			
			// *********** [/SVG mp3-direct] ***********

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

	
}());