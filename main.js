// main.js
var React = require('react');
var ReactDOM = require('react-dom');
var ReactBsTable  = require('react-bootstrap-table');
var BootstrapTable = ReactBsTable.BootstrapTable;
var TableHeaderColumn = ReactBsTable.TableHeaderColumn;
var TableDataSet = ReactBsTable.TableDataSet;

// ID,Connection,Narrative fragment,Name,Class,Groups,Scale,Posneg,Issue,Participant speech

function onAfterSaveCell(row, cellName, cellValue){
  console.log("Save cell '"+cellName+"' with value '"+cellValue+"'");
  console.log("The whole row :");
  console.log(row);
  $.post("/actors/sheetupdate",
    {
		workshop_id: workshop_id,
        _id: row._id,
        name: cellName,
		value: cellValue
    },
    function(status){
        console.log("\nStatus: " + status);
    });
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

var OptionsSettings = {
	afterInsertRow: addARow,
	onDeleteRow: delRow	
};

function delRow(row){
	console.log("Delete A Row Called");
	console.log("Row Data: " + row);
	
  $.post("/actors/deleteActors",
    {
		workshop_id: workshop_id,
		row: row
    },
    function(status){
        console.log("\nStatus: " + status);
    });
	
}

function addARow(row){
	console.log("Add A Row Called");
	console.log("Row Data: " + row);
	
  $.post("/actors/sheetadd",
    {
		workshop_id: workshop_id,
		row: row
    },
    function(status){
        console.log("\nStatus: " + status);
    });
	
};


ReactDOM.render(
  React.createElement(BootstrapTable, {data: actors, search: true, deleteRow: true, selectRow: selectRowProp, cellEdit: cellEditProp, options: OptionsSettings}, 
	  React.createElement(TableHeaderColumn, {dataField: "_id", isKey: true, hidden: true}, "_id"),
	  React.createElement(TableHeaderColumn, {dataField: "Name"}, "Name"),
	  React.createElement(TableHeaderColumn, {dataField: "Class"}, "Class"),
	  React.createElement(TableHeaderColumn, {dataField: "Groups"}, "Groups"), 
	  React.createElement(TableHeaderColumn, {dataField: "Scale"}, "Scale"),
	  React.createElement(TableHeaderColumn, {dataField: "Issue"}, "Issue"),
	  React.createElement(TableHeaderColumn, {dataField: "Narrative fragment"}, "Narrative fragment"),
	  React.createElement(TableHeaderColumn, {dataField: "Participant speech"}, "Participant speech")
  ),
	document.getElementById("actors")
);