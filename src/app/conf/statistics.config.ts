import * as Highcharts from 'highcharts';

export let STATS_OPTIONS: any = {
    chart: {
      type: 'scatter',
      backgroundColor: 'rgba(0,0,0,0)'
    },
    navigator: {
        enabled: true,
    },

    title: {
      text: null
    },
    credits: {
      enabled: false
    },
    legend: {
      enabled: true,
    },
    xAxis: {
      type: 'datetime',
      labels: {
        formatter() {
          return Highcharts.dateFormat('%e %b', this.value);
        }
      }
    },
    tooltip: {
      shared: true,
      formatter() {
          return this.points ?
            `${Highcharts.dateFormat('%e %B', this.x)}<br/>${this.points.map(p => p.series.tooltipOptions.formatter(p)).join('<br/>')}`
            : `<b> ${Highcharts.dateFormat('%e %B', this.x)} - ${this.series.name}</b><br />${this.point.label}`;
      },
  },
    series: []
  };
