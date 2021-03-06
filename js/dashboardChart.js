Chart.defaults.doughnutLabels = Chart.helpers.clone(Chart.defaults.doughnut);

var helpers = Chart.helpers;
var defaults = Chart.defaults;

Chart.controllers.doughnutLabels = Chart.controllers.doughnut.extend({
	updateElement: function(arc, index, reset) {
    var _this = this;
    var chart = _this.chart,
        chartArea = chart.chartArea,
        opts = chart.options,
        animationOpts = opts.animation,
        arcOpts = opts.elements.arc,
        centerX = (chartArea.left + chartArea.right) / 2,
        centerY = (chartArea.top + chartArea.bottom) / 2,
        startAngle = opts.rotation, // non reset case handled later
        endAngle = opts.rotation, // non reset case handled later
        dataset = _this.getDataset(),
        circumference = reset && animationOpts.animateRotate ? 0 : arc.hidden ? 0 : _this.calculateCircumference(dataset.data[index]) * (opts.circumference / (2.0 * Math.PI)),
        innerRadius = reset && animationOpts.animateScale ? 0 : _this.innerRadius,
        outerRadius = reset && animationOpts.animateScale ? 0 : _this.outerRadius,
        custom = arc.custom || {},
        valueAtIndexOrDefault = helpers.getValueAtIndexOrDefault;

    helpers.extend(arc, {
      // Utility
      _datasetIndex: _this.index,
      _index: index,

      // Desired view properties
      _model: {
        x: centerX + chart.offsetX,
        y: centerY + chart.offsetY,
        startAngle: startAngle,
        endAngle: endAngle,
        circumference: circumference,
        outerRadius: outerRadius,
        innerRadius: innerRadius,
        label: valueAtIndexOrDefault(dataset.label, index, chart.data.labels[index])
      },

      draw: function () {
      	var ctx = this._chart.ctx,
						vm = this._view,
						sA = vm.startAngle,
						eA = vm.endAngle,
						opts = this._chart.config.options;

					var labelPos = this.tooltipPosition();
					var segmentLabel = vm.circumference / opts.circumference * 100;
					var labelText = vm.label;
					ctx.beginPath();

					ctx.arc(vm.x, vm.y, vm.outerRadius, sA, eA);
					ctx.arc(vm.x, vm.y, vm.innerRadius, eA, sA, true);

					ctx.closePath();
					ctx.strokeStyle = vm.borderColor;
					ctx.lineWidth = vm.borderWidth;

					ctx.fillStyle = vm.backgroundColor;

					ctx.fill();
					ctx.lineJoin = 'bevel';

					if (vm.borderWidth) {
						ctx.stroke();
					}

					if (vm.circumference > 0.15) { // Trying to hide label when it doesn't fit in segment
						ctx.beginPath();
						ctx.font = helpers.fontString(18, opts.defaultFontStyle, "raleway");
						ctx.fillStyle = "#ffffff";
						ctx.textBaseline = "top";
						ctx.textAlign = "center";
            // Round percentage in a way that it always adds up to 100%
						ctx.fillText(labelText, labelPos.x, labelPos.y - 20);
						ctx.fillText(segmentLabel.toFixed(0) + "%", labelPos.x, labelPos.y);
					}
      }
    });

    var model = arc._model;
    model.backgroundColor = custom.backgroundColor ? custom.backgroundColor : valueAtIndexOrDefault(dataset.backgroundColor, index, arcOpts.backgroundColor);
    model.hoverBackgroundColor = custom.hoverBackgroundColor ? custom.hoverBackgroundColor : valueAtIndexOrDefault(dataset.hoverBackgroundColor, index, arcOpts.hoverBackgroundColor);
    model.borderWidth = custom.borderWidth ? custom.borderWidth : valueAtIndexOrDefault(dataset.borderWidth, index, arcOpts.borderWidth);
    model.borderColor = custom.borderColor ? custom.borderColor : valueAtIndexOrDefault(dataset.borderColor, index, arcOpts.borderColor);

    // Set correct angles if not resetting
    if (!reset || !animationOpts.animateRotate) {
      if (index === 0) {
        model.startAngle = opts.rotation;
      } else {
        model.startAngle = _this.getMeta().data[index - 1]._model.endAngle;
      }

      model.endAngle = model.startAngle + model.circumference;
    }

    arc.pivot();
  }
});

var config = {
  type: 'doughnutLabels',
  data: {
    datasets: [{
      data: [30, 29, 10, 12, 19],
      backgroundColor: [
			'rgba(58, 154, 179, 1)',
			'rgba(75, 192, 192, 1)',
      'rgba(178, 172, 218, 1)',
			'rgba(115, 128, 189, 1)',
      '#475a77'
      ],
      borderColor: [
				'#ffffff',
				'#ffffff',
				'#ffffff',
				'#ffffff',
				'#ffffff'
     ],
     borderWidth: 1,
     hoverBorderWidth:3
     }],
  labels: ["Social Media", 'School', 'Entertainment', 'News','Shopping']
  },
  options: {
    responsive: true,
    legend: {
			display:false,
      position: 'right',
     labels: {fontSize: 13, fontFamily: "raleway"},
             onClick: function(event, legendItem) {}
    },
    animation: {
      animateScale: true,
      animateRotate: true
    },
    hover: {
      onHover: function(e) {
        $("#dashboard_canvas").css("cursor", e[0] ? "pointer" : "default");
     }
    }
  }
};

var ctx = document.getElementById("myChart").getContext("2d");
var myNewChart = new Chart(ctx, config);

/*fix height problem*/
function adjustChartSize(){
     var w = $(window).width();
var h = $(window).height();
        $("#myChart").css({
                width:Math.min(w,h)*0.80,
                height: Math.min(w,h)*0.80
}		);
}
adjustChartSize();  //onload
$(window).resize(adjustChartSize);

document.getElementById("myChart").onclick = function(evt){
    var activePoints = myNewChart.getElementsAtEvent(evt);
   //check if clicked on area of graph
    if(Object.keys(activePoints).length > 0)
    {
			var firstPoint = activePoints[0];
			var title = myNewChart.data.labels[firstPoint._index];

			//a global variable
			category = title;
			localStorage.setItem("category", title);
			window.location.href = "myStats";
    }
};
