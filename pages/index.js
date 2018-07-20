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