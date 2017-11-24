'use strict'

const express = require('express'),
  router = express.Router(),
  root = process.cwd() + '/',
  fs = require('fs'),
  config = require(root + 'config.json'),
  deviceList = require(root + 'assets/devices.json')

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', {
    title: 'Express'
  })
})

// devices route
router.post('/holiday', (req, res, next) => {
  if (!req.body || req.body.token !== config.verificationToken) {
    res.status(400).send({
      test: 'Service temporarily unavailable'
    })
  } else {
    let resp
    switch (req.body.text) {
      case '?':
        resp = '*please declare your holiday days*'
        break

      default:
        resp = createHolidayRequest(req.body.text)
    }
    res.send(resp)
  }
})

// This route will answer button clicks
router.post('/buttons', (req, res, next) => {
  let payload = JSON.parse(req.body.payload)
  if (!payload || payload.token !== config.verificationToken) {
    res.status(400).send({
      test: 'Service temporarily unavailable'
    })
  } else {
    let device = deviceList[payload.actions[0].value],
      action = payload.actions[0].name,
      resp = {
        mrkdwn: true
      }

    switch (action) {
      case 'send_request':
      console.log(payload.actions.value);
      console.log("___________IN");
        console.log(payload);
        resp.text = `The request is sent`;
        resp.delete_original = true;

        break;
      default:
        console.log("default");
        break;
    }
    res.send(resp)
  }
})

module.exports = router

// private functions
function createHolidayRequest(payload) {
  let dates = payload.split(" ");
  let dateFrom = dates[0];
  let dateTo = dates[1];
  let response = {
      mrkdwn: true,
      text: 'Here your *holiday request*.\nAfter booking your request will be submited to your line manager for approval.',
      attachments: [
        {
          color: '#000000',
          mrkdwn_in: ["fields"],
          callback_id: "holiday_request",
          fields: [
            {
              title: 'From',
              short: true
            },
            {
              title: 'To',
              short: true
            }
          ],
          actions: [
            {
              name: 'send_request',
              text: 'Submit the request',
              type: 'button',
              style: 'primary',
              value: dateFrom + ";" + dateTo
            }
          ]
        }
      ]
    }

  response.attachments[0].fields[0].value = dateFrom;
  response.attachments[0].fields[1].value = dateTo;
  return response
}
