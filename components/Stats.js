import React, { Fragment } from 'react'
import { Line } from 'react-chartjs-2'

const Stats = props => {

  const { choices = [], stats = {} } = props
  const counts = choices.map(choice => stats[choice] || 0);
  const totalCount = counts.reduce((total, count) => total + count, 0)

  const chartData = {
    labels: choices,
    datasets: [
      {
        lineTension: 0,
        backgroundColor: 'rgba(68, 204, 153, 0.05)',
        borderColor: 'rgba(68, 204, 153, 0.9)',
        borderWidth: 2,
        borderJoinStyle: 'round',
        pointRadius: 5,
        pointBorderColor: '#fff',
        pointBackgroundColor: 'rgba(68, 204, 153, 0.9)',
        pointBorderWidth: 3,
        data: counts
      }
    ]
  }

  const chartOptions = {
    layout: { padding: { top: 25, bottom: 75, left: 75, right: 75 } },
    maintainAspectRatio: false,
    scales: {
      yAxes: [{
        ticks: { beginAtZero: true, display: false }
      }]
    },
    legend: { display: false },
    title: {
      display: true,
      text: 'POLL COUNTS',
      padding: 10,
      lineHeight: 4,
      fontSize: 20,
      fontColor: '#677'
    }
  };

  return <Fragment></Fragment>

}

export default Stats