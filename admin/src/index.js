const express = require("express")
const bodyParser = require("body-parser")
const config = require("config")
const request = require("request")
const csvStringify = require('csv-stringify')

const app = express()

app.use(bodyParser.json({limit: "10mb"}))

app.get("/investments/:id", (req, res) => {
  const {id} = req.params
  request.get(`${config.investmentsServiceUrl}/investments/${id}`, (e, r, investments) => {
    if (e) {
      console.error(e)
      res.send(500)
    } else {
      res.send(investments)
    }
  })
})

app.get("/export", (req, res) => {
  request.get(`${config.investmentsServiceUrl}/investments`, (e, r, investmentsRaw) => {
    const investments = JSON.parse(investmentsRaw)
    // const investmentsCSV = csvStringify.stringify(investments)

    res.write(csvStringify.stringify(investments).pipe(process.stdout))
  })
})

app.listen(config.port, (err) => {
  if (err) {
    console.error("Error occurred starting the server", err)
    process.exit(1)
  }
  console.log(`Server running on port ${config.port}`)
})
