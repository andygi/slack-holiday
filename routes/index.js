"use strict"

const express = require("express"),
  router = express.Router(),
  root = process.cwd() + "/",
  fs = require("fs"),
  config = require(root + "config.json"),
  deviceList = require(root + "assets/devices.json"),
  myData = require(root + "assets/myStatus.json")

/* GET home page. */
router.get("/", (req, res, next) => {
  res.render("index", {
    title: "Express"
  })
})

// devices route
router.post("/holiday", (req, res, next) => {
  if (!req.body || req.body.token !== config.verificationToken) {
    res.status(400).send({
      test: "Service temporarily unavailable"
    })
  } else {
    let resp
    switch (req.body.text) {
      case "?":
        resp = "*please declare your holiday days*"
        break;
      default:
        resp = createHolidayRequest(req.body.text);
        break;
    }
    res.send(resp)
  }
})

// This route will answer button clicks
router.post("/buttons", (req, res, next) => {
  let payload = JSON.parse(req.body.payload)
  if (!payload || payload.token !== config.verificationToken) {
    res.status(400).send({
      test: "Service temporarily unavailable"
    })
  } else {
    let device = deviceList[payload.actions[0].value],
      action = payload.actions[0].name,
      resp = {
        mrkdwn: true
      }

    switch (action) {
      case "send_request":
        let payLoadStr = JSON.parse(JSON.stringify(payload));
        let dates = payLoadStr.actions[0].value;
        let datesAr = dates.split(";");
        resp.text = `The request for holiday from *`+ unconvertDate(datesAr[0]) +`* to *`+ unconvertDate(datesAr[1]) +`* is sent`;
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
function convertDate(value) {
  let output = 0;
  if (value) {
    let valueAr = value.split("/");
    output = new Date(valueAr[2], valueAr[1] - 1, valueAr[0]).getTime() / 1000;
  } else {
    output = Math.round(new Date().getTime() / 1000);
  }
  return output;
}

function unconvertDate(value) {
  let myDate = new Date(value*1000);
  let output = myDate.getDate() + "/" + (myDate.getMonth() + 1) + "/" + myDate.getFullYear();
  return output;
}

function createHolidayRequest(payload) {
  let dates = payload.split(" ");
  let today = convertDate();
  let dateFrom = convertDate(dates[0]);
  let dateTo = convertDate(dates[1]);
  let response = {
      "mrkdwn": "true",
      "text": "Here your *holiday request*.\nAfter booking your request will be submited to your line manager `" + myData.lineManager.name + "` for approval.\nYou have: *" + myData.holiday.booked + "* days booked, *" + myData.holiday.pending + "* days pending and *" + myData.holiday.available + "* days available",
      "attachments": [
        {
          "color": "#000000",
          "mrkdwn_in": ["fields"],
          "callback_id": "holiday_request",
          "fields": [
            {
              "title": "From",
              "short": true
            },
            {
              "title": "To",
              "short": true
            }
          ],
          "actions": [
            {
              "name": "send_request",
              "text": "Submit the request",
              "type": "button",
              "style": "primary",
              "value": dateFrom + ";" + dateTo
            }
          ]
        }
      ]
    }

  response.attachments[0].fields[0].value = unconvertDate(dateFrom);
  response.attachments[0].fields[1].value = unconvertDate(dateTo);
  return response
}
