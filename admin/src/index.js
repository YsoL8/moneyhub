const express = require("express")
const bodyParser = require("body-parser")
const config = require("config")
const request = require("request")

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
    if (e) {
      console.error(e)
      res.send(500)
    } else {
      request.get(`${config.financialCompaniesServiceUrl}/companies`, (e, r, companiesRaw) => {
        if (e) {
          console.error(e)
          res.send(500)
        } else {
          const companies = JSON.parse(companiesRaw)
          const investments = JSON.parse(investmentsRaw)
          const headings = 'User|First Name|Last Name|Date|Holding|Value'
          const csvRows = investments.map(investment => {
            return investment.holdings.map(holding => {
              const company = companies.filter(company => {
                if (company.id === holding.id) {
                  return true
                }
                return false
              })
              console.log(company)
              return `${investment.userId},${investment.firstName},${investment.lastName},${investment.date}`
            })
          })
          const response = headings + csvRows.join("\r\n")

          res.send(response)
        }
      })
    }
  })
})

app.listen(config.port, (err) => {
  if (err) {
    console.error("Error occurred starting the server", err)
    process.exit(1)
  }
  console.log(`Server running on port ${config.port}`)
})
