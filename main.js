// main.js
var React = require('react');
var ReactDOM = require('react-dom');
var ReactBsTable  = require('react-bootstrap-table');
var BootstrapTable = ReactBsTable.BootstrapTable;
var TableHeaderColumn = ReactBsTable.TableHeaderColumn;
var TableDataSet = ReactBsTable.TableDataSet;

var products = [
{
    id: 1,
    name: "Product1",
    price: 120
},{
    id: 2,
    name: "Product2",
    price: 80
},{
    id: 3,
    name: "Product3",
    price: 207
},{
    id: 4,
    name: "Product4",
    price: 100
},{
    id: 5,
    name: "Product5",
    price: 150
},{
    id: 6,
    name: "Product6",
    price: 160
}
];

// ID,Connection,Narrative fragment,Name,Class,Groups,Scale,Posneg,Issue,Participant speech

function onAfterSaveCell(row, cellName, cellValue){
  console.log("Save cell '"+cellName+"' with value '"+cellValue+"'");
  console.log("The whole row :");
  console.log(row);
  // Here we handle updating the data.
  // Should update the local data and the remote data
  // Remote update should be AJAX style not require a reload of page 
};

var cellEditProp = {
  mode: "click",
  blurToSave: true,
  afterSaveCell: onAfterSaveCell
};

function onRowSelect(row, isSelected){
  console.log(row);
  console.log("selected: " + isSelected)
};

function onSelectAll(isSelected){
  console.log("is select all: " + isSelected);
};

var selectRowProp = {
  mode: "checkbox",
  clickToSelect: true,
  bgColor: "rgb(238, 193, 213)",
  onSelect: onRowSelect,
  onSelectAll: onSelectAll
};

ReactDOM.render(
  React.createElement(BootstrapTable, {data: actors, search: true, insertRow: true, deleteRow: true, selectRow: selectRowProp, cellEdit: cellEditProp}, 
      React.createElement(TableHeaderColumn, {dataField: "ID", isKey: true}, "ID"), 
      React.createElement(TableHeaderColumn, {dataField: "Connection"}, "Connection"),
	  React.createElement(TableHeaderColumn, {dataField: "Narrative fragment"}, "Narrative fragment"),
	  React.createElement(TableHeaderColumn, {dataField: "Name"}, "Name"),
	  React.createElement(TableHeaderColumn, {dataField: "Class"}, "Class"),
	  React.createElement(TableHeaderColumn, {dataField: "Groups"}, "Groups"), 
	  React.createElement(TableHeaderColumn, {dataField: "Scale"}, "Scale"),
	  React.createElement(TableHeaderColumn, {dataField: "Posneg"}, "Posneg"),
	  React.createElement(TableHeaderColumn, {dataField: "Issue"}, "Issue"),
	  React.createElement(TableHeaderColumn, {dataField: "Participant speech"}, "Participant speech")
  ),
	document.getElementById("actors")
);