'use strict';

var $ = require('jquery');
var employee = require('./employee').employee;

let statsTemplate = require('./template/stats.hbs');
let employeeImagesTemplate = require('./template/employee-images.hbs');

let employees = {};

function createMonthMap(fromDate, toDate) {
  let result = new Map();
  let currentDate = fromDate;
  let i = 1;
  while (currentDate < toDate) {
    result.set(i++, currentDate);
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getYear();
    let newMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    let newYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    currentDate = new Date(1900 + newYear, newMonth);
  }

  return result;
}

let months = createMonthMap(new Date(2007,2), new Date(2016,1));

function displayEmployees(data) {
  let images = data.map(function(v) {
    return {
      file: v.image(),
      employeeName: v.name()
    };
  });

  $('#employee-images').replaceWith(employeeImagesTemplate({images: images}));
}

function displayMonth(month) {
  $('#rangemonth').text(month.toDateString());
}

function displayStats(data) {
  $('#stats').replaceWith(statsTemplate({numberOfEmployees: data.length, ratio: 1, alumni: 1}));
}

function currentEmployees(data) {
  return data.filter(function(employee) { return employee.isCurrentlyEmployed(); });
}

function employeesOnDate(data, date) {
  return data.filter(function(employee) {
    return employee.isEmployedOn(date);
  });
}

function initialize() {
  fetch('/data/employees.json')
    .then(function(response) {
      return response.json();
    })
    .then(function(json) {
      employees = json.map(employee);
    })
    .then(function() {
      displayEmployees(currentEmployees(employees));
    })
    .catch(function(ex) {
      console.log('Failed to fetch employees.', ex);
    });
}

initialize();

$('#rangepicker').change(function() {
  let chosenValue= $(this).val();
  let chosenMonth = months.get(parseInt(chosenValue));
  displayMonth(chosenMonth);
  displayEmployees(employeesOnDate(employees, chosenMonth));
  displayStats(employeesOnDate(employees, chosenMonth));
});

$('#rangepicker').attr('max', months.size);

module.exports.currentEmployees = currentEmployees;
module.exports.employeesOnDate = employeesOnDate;

