import * as Highcharts from 'highcharts';

export let STATS_OPTIONS: any = {
    chart: {
      type: 'scatter',
      height: 700,
      backgroundColor: 'rgba(0,0,0,0)'
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
    series: []
  };
