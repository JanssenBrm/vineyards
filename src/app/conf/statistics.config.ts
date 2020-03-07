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
    tooltip: {
      formatter() {
        return 'x: ' + Highcharts.dateFormat('%e %b %y %H:%M:%S', this.x) +
          'y: ' + this.y.toFixed(2);
      }
    },
    xAxis: {
      type: 'datetime',
      labels: {
        formatter() {
          return Highcharts.dateFormat('%e %b %y', this.value);
        }
      }
    },
    series: [
      {
        name: 'Normal',
        turboThreshold: 500000,
        data: [[new Date('2018-01-25 18:38:31').getTime(), 2]]
      },
      {
        name: 'Abnormal',
        turboThreshold: 500000,
        data: [[new Date('2018-02-05 18:38:31').getTime(), 7]]
      }
    ]
  };
