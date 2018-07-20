# Realtime Poll

```
mkdir realtime-poll
cd realtime-poll
yarn init
```

### .gitignore
```
# build output
dist
.next

# dependencies
node_modules
package-lock.json
test/node_modules

# logs & pids
*.log
pids

# coverage
.nyc_output
coverage

# test output
test/**/out
.DS_Store

.env
```

### Install Dependencies
```
yarn add react react-dom next pusher pusher-js chart.js react-chartjs-2 --save
yarn add express body-parser cors dotenv axios --save
yarn add cross-env npm-run-all --dev
```

### [Pusher](https://dashboard.pusher.com/) .env
```
PUSHER_APP_ID=YOUR_APP_ID
PUSHER_APP_KEY=YOUR_APP_KEY
PUSHER_APP_SECRET=YOUR_APP_SECRET
PUSHER_APP_CLUSTER=YOUR_APP_CLUSTER
```

### next.config.js
```
const webpack = require('webpack')
require('dotenv').config()

module.exports = {
  webpack: config => {
    const env = Object.keys(process.env).reduce((acc, curr) => {
      acc[`process.env.${curr}`] = JSON.stringify(process.env[curr])
      return acc
    }, {})

    config.plugins.push(new webpack.DefinePlugin(env))

    return config
  }
}
```

### server.js
```
const cors = require('cors')
const next = require('next')
const Pusher = require('pusher')
const express = require('express')
const bodyParser = require('body-parser')
const dotenv = require('dotenv').config()

const dev = process.env.NODE_ENV !== 'production'
const port = process.env.PORT || 3000

const app = next({ dev })
const handler = app.getRequestHandler()

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_APP_KEY,
  secret: process.env.PUSHER_APP_SECRET,
  cluster: process.env.PUSHER_APP_CLUSTER,
  encrypted: true
})

app.prepare()
  .then(() => {

    const server = express()

    server.use(cors())
    server.use(bodyParser.json())
    server.use(bodyParser.urlencoded({ extended: true }))

    server.get('*', (req, res) => {
      return handler(req, res)
    })

    server.listen(port, err => {
      if (err) throw err
      console.log(`> Ready on http://localhost:${port}`)
    })

  })
  .catch(ex => {
    console.error(ex.stack)
    process.exit(1)
  })
```

### package.json
```
"scripts": {
  "dev": "node server.js",
  "build": "next build",
  "prod:server": "cross-env NODE_ENV=production node server.js",
  "start": "npm-run-all -s build prod:server"
}
```

### components/Layout.js
```
import React, { Fragment } from 'react'
import Head from 'next/head'

const Layout = props => (
  <Fragment>
    <Head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossOrigin="anonymous" />
      <title>{props.pageTitle || 'Realtime Poll'}</title>
    </Head>
    {props.children}
  </Fragment>
)

export default Layout
```

### pages/index.js
```
import React, { Component, Fragment } from 'react'
import Layout from '../components/Layout'

class IndexPage extends Component {

  render() {
    return (
      <Layout pageTitle="Realtime Poll">
        <main className="container-fluid position-absolute h-100 bg-light">
          <div className="row position-absolute w-100 h-100">

            <section className="col-md-7 d-flex flex-row flex-wrap align-items-center align-content-center px-5 border-right border-gray"></section>

            <section className="col-md-5 position-relative d-flex flex-wrap h-100 align-items-start align-content-between bg-white px-0"></section>

          </div>
        </main>
      </Layout>
    )
  }

}

export default () => (
  <Fragment>
    <IndexPage />
  </Fragment>
)
```

### components/Poll.js
```
import React, { Component, Fragment } from 'react'
import axios from 'axios'

class Poll extends Component {

  state = { selected: null }

  handleSubmit = evt => {
    axios.post('/answer', { choice: this.state.selected })
    this.setState({ selected: null })
  }

  render() {

    const { selected: selectedChoice } = this.state
    const { question = null, choices = [] } = this.props

    return (
      <Fragment>

        <span className="d-block w-100 h5 text-uppercase text-primary font-weight-bold mb-4" style={{ marginTop: -50 }}>Poll for the Day</span>

        <span className="d-block w-100 h1 text-dark">{question}</span>

        <div className="my-5 pt-0 pb-5">
          {
            choices.map((choice, index) => {

              const handleClick = selected => evt => this.setState({ selected })

              const selected = selectedChoice && selectedChoice === choice

              const labelClass = ['custom-control-label pl-5 position-relative', selected ? 'checked' : ''].join(' ')

              return (
                <div key={index} className="custom-control custom-radio py-3 ml-2 d-flex align-items-center">
                  <input className="custom-control-input" type="radio" name="poll-response" id={`poll-response--radio-${index + 1}`} value={choice} checked={selected} />

                  <label className={labelClass} htmlFor={`poll-response--radio-${index + 1}`} onClick={handleClick(choice)}>{ choice }</label>
                </div>
              )

            })
          }
        </div>

        <button type="button" className={`btn btn-primary text-uppercase my-5 ml-4 px-5 py-3 d-block ${selectedChoice ? '' : 'in'}visible`} disabled={!selectedChoice} onClick={this.handleSubmit}>Submit</button>

      </Fragment>
    )
  }

}

export default Poll
```

### global style in pages/index.js
```
<style global jsx>{`

.custom-control-label {
  background: transparent;
  color: #999;
  font-size: 2rem;
  font-weight: 500;
  cursor: pointer;
  line-height: 2.25rem;
}

.custom-control-label:before, .custom-control-label:after {
  top: 0;
  left: -10px;
  height: 2.25rem;
  width: 2.25rem;
  cursor: pointer;
  box-shadow: none !important;
}

.custom-control-label.checked {
  color: #007bff !important;
}

button.btn {
  letter-spacing: 1px;
  font-size: 1rem;
  font-weight: 600;
}

`}</style>
```

### components/Stats.js
```
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
```

### Render Chart
```
return (
  <Fragment>

    <div className="position-relative h-50 w-100 d-flex align-items-center border-bottom border-gray">
      <Line data={chartData} width={100} height={50} options={chartOptions} />
    </div>

    <div className="position-relative h-50 w-100 d-flex flex-wrap align-items-start align-content-start">

      <div className="d-flex flex-wrap w-100 text-center justify-content-center align-items-center align-content-center" style={{ height: 'calc(100% - 150px)' }}>
        <span className="d-block w-100 text-uppercase pb-2 font-weight-bold text-secondary" style={{ fontSize: '1.25rem' }}>Total Count</span>
        <span className="d-block w-100 text-dark" style={{ fontSize: '5rem' }}>{totalCount}</span>
      </div>

      <div className="w-100 d-flex justify-content-between align-items-center text-center border-top border-gray" style={{ height: 100 }}>
        {
          counts.map((count, index) => {
            const className = ['h-100 position-relative d-flex align-items-center', index > 0 ? 'border-left border-gray' : ''].join(' ');

            return (
              <div key={index} className={className} style={{ width: '20%', fontSize: '2rem' }}>
                <span className="d-block w-100 p-3 text-dark">{count}</span>
              </div>
            )
          })
        }
      </div>

      <div className="w-100 d-flex justify-content-between align-items-center text-center border-top border-gray bg-light" style={{ height: 50 }}>
        {
          choices.map((choice, index) => {

            const className = ['h-100 position-relative d-flex align-items-center', index > 0 ? 'border-left border-gray' : ''].join(' ')

            return (
              <div key={index} className={className} style={{ width: '20%', fontSize: '0.7rem' }}>
                <span className="d-block w-100 text-uppercase p-3 font-weight-bold text-secondary">{choice}</span>
              </div>
            );

          })
        }
      </div>

    </div>

  </Fragment>
)
```

### Init Pusher
```
state = { answers: {} }

componentDidMount() {

  this.pusher = new Pusher(process.env.PUSHER_APP_KEY, {
    cluster: process.env.PUSHER_APP_CLUSTER,
    encrypted: true
  })

  this.channel = this.pusher.subscribe('poll-board')

  this.channel.bind('new-answer', ({ choice, count }) => {
    let { answers } = this.state
    answers = { ...answers, [choice]: count }
    this.setState({ answers })
  })

  this.pusher.connection.bind('connected', () => {
    axios.post('/answers')
      .then(response => {
        const answers = response.data.answers
        this.setState({ answers })
      })
  })

}

componentWillUnmount() {
  this.pusher.disconnect()
}
```

### Import
```
import axios from 'axios'
import Pusher from 'pusher-js'
import Poll from '../components/Poll'
import Stats from '../components/Stats'
```

### Render Choices
```
render() {
  const question = `What do you think about this course?`
  const choices = ['Excellent', 'Good', 'Average', 'Fair', 'Poor']

  return (
    <Layout pageTitle="Realtime Poll">
      <main className="container-fluid position-absolute h-100 bg-light">
        <div className="row position-absolute w-100 h-100">

          <section className="col-md-7 d-flex flex-row flex-wrap align-items-center align-content-center px-5 border-right border-gray">
            <div className="px-5 mx-5">
              <Poll question={question} choices={choices} />
            </div>
          </section>

          <section className="col-md-5 position-relative d-flex flex-wrap h-100 align-items-start align-content-between bg-white px-0">
            <Stats choices={choices} stats={this.state.answers} />
          </section>

        </div>
      </main>
    </Layout>
  )
}
```

### Router Answers
```
let answers = {}

server.post('/answer', (req, res, next) => {
  const { choice = null } = req.body

  if (choice) {
    const hasChoice = choice in answers && typeof answers[choice] === 'number'
    const count = ( hasChoice ? Math.max(0, answers[choice]) : 0 ) + 1

    answers = { ...answers, [choice]: count }

    pusher.trigger('poll-board', 'new-answer', { choice, count })
  }
})

server.post('/answers', (req, res, next) => {
  res.json({ answers, status: 'success' })
})
```