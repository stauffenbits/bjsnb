var RSNBApp = angular.module('RSNBApp', []);

var RSNBController = RSNBApp.controller("RSNBController", 
  ["$scope", "$http", "$sce", "$element", "$document",
  function($scope, $http, $sce, $element, $document){
  $scope.notebooks = []
  $scope.current = null;
    
  // https://stackoverflow.com/a/10080841
  $("textarea").keyup(function(e) {
    while($(this).outerHeight() < this.scrollHeight + parseFloat($(this).css("borderTopWidth")) + parseFloat($(this).css("borderBottomWidth"))) {
        $(this).height($(this).height()+1);
    };
  });
  
  $scope.storeNotebook = function(notebook){
    if(!notebook){
      notebook = $scope.current;
    }
      
    var nb = Object.assign({}, notebook);
    nb.cells = nb.cells.map((cell, i) => {
      var copy = Object.assign({}, cell, {
        editor: null, 
        cellSource: null,
        source: cell.cell_type == 'markdown' ? 
          cell.editor.codemirror.getValue().split(/\n/) :
          cell.source
      });
        
      return copy
    });
    
    console.log(nb);
    window.localStorage.setItem(notebook.name, JSON.stringify(nb));
  }
      
  $scope.initMarkdownCell = function(nbIndex, cellIndex){
    var elem = document.querySelector(`.notebook${nbIndex} * .cell${cellIndex}`);
    if(!elem) return;
      
    var cell = $scope.notebooks[nbIndex].cells[cellIndex];
    if(!cell) return;
    
    if(!cell.editor){
      cell.editor = new Editor({lineWrapping: true});
    }
      
    cell.editor.render(document.querySelector(`.notebook${nbIndex} * .markdown.cell${cellIndex}`));
    cell.editor.codemirror.setValue(cell.source.join('\n'));
      
    return cell;
  }
      
  $scope.initAllMarkdownCells = function(notebook){
    if(!notebook.index){
      notebook.index = $scope.notebooks.indexOf(notebook);
    }
      
    for(var i=0; i<notebook.cells.length; i++){
      $scope.initMarkdownCell(notebook.index, i);
    }
  }
      
  $scope.display = function(notebook){
    if(!notebook) return;
    $scope.current = notebook;
    $scope.initAllMarkdownCells(notebook);
  }

  $scope.loadNotebooks = function(){
    $scope.notebooks = [];
    var notebookNames = Object.keys(window.localStorage);
    for(var i=0; i<notebookNames.length; i++){
      var notebook = JSON.parse(localStorage.getItem(notebookNames[i]));
      if(!notebook) return;
      $scope.notebooks.push(notebook);
    }
      
    for(var i=0; i<$scope.notebooks.length; i++){
      for(var j=0; j<$scope.notebooks[i].cells.length; j++){
        if($scope.notebooks[i].cells[j].cell_type === 'markdown'){
          $scope.initMarkdownCell(i, j);
        }
      }
    }
      
    return $scope.notebooks;
  }
    
  $scope.loadNotebooks();
    
  $scope.upload = function(){
    var form = document.querySelector("form");
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const files = document.querySelector('[type=file]').files;

      for (let i = 0; i < files.length; i++) {
        let file = files[i];
        let notebook = JSON.parse(await file.text());
        console.log(notebook)
        notebook.name = file.name;
        
        var nb = null;
        if(nb = $scope.notebooks.findIndex(nb => nb.name === notebook.name) === -1){
          $scope.notebooks.push(notebook);
        }else{
          $scope.notebooks[nb] = notebook;
        }
        
        $scope.storeNotebook(notebook);
        $scope.display(notebook);
        $scope.$apply();
      }
    })
  }
    
  $scope.addNotebook = function(){
    var name = prompt('A Name for the Notebook?');
    if(!name) return;
    if(!name.endsWith('.es.ipynb')){
      name += '.es.ipynb'
    }
    var notebook = {
     "cells": [
      {
       "cell_type": "code",
       "execution_count": null,
       "metadata": {},
       "outputs": [],
       "source": []
      }
     ],
     "metadata": {
      "kernelspec": {
       "display_name": "Browser Javascript",
       "language": "ECMAScript",
       "name": "Javascript"
      },
      "language_info": {
       "codemirror_mode": {
        "name": "es.ipynb",
        "version": 3
       },
       "file_extension": ".es.ipynb",
       "mimetype": "application/json",
       "name": "javascript",
       "version": "1.0.0"
      }
     },
     "nbformat": 4,
     "nbformat_minor": 4
    };  
      
    notebook.name = name;
      
    $scope.notebooks.push(notebook);
    $scope.initAllMarkdownCells(notebook);

    $scope.storeNotebook(notebook);
  }

  $scope.removeNotebook = function(notebook){
    window.localStorage.removeItem(notebook.name)
    $scope.loadNotebooks();
  }
    
  $scope.run = function(cell, code){
    if(cell.cell_type != 'code') return;
    cell.source = code.split(/\n/);
    var result = window.eval(code);
    cell.output = [result];
    cell.execution_count = cell.execution_count === null ? 0 : cell.execution_count + 1;
    return result;
  }
    
  $scope.runAll = function(notebook){
    notebook.cells = notebook.cells.map(function(cell){
      if(cell.cell_type == 'code'){
        $scope.run(cell, cell.cellSource);
      }
      return cell;
    });
  }
    
  $scope.clearAll = function(notebook){
    notebook.cells.forEach(cell => cell.source = [''])
  }

  $scope.downloadNotebook = function(notebook){
    download(localStorage.getItem(notebook.name), `${notebook.name}${notebook.name.endsWith('.es.ipynb') ? '' : '.es.ipynb'}`, 'application/json')
  }

  $scope.addCell = function(notebook){
    notebook.cells.push({
       "cell_type": "code",
       "execution_count": null,
       "metadata": {},
       "outputs": [],
       "source": []
      })
  }

  $scope.removeCell = function(notebook, cell){
    notebook = notebook.cells.splice(notebook.cells.indexOf(cell), 1)
  }
    
  $scope.isObject = function(potObj){
    return potObj instanceof Object;
  }
    
  $scope.isArray = function(potArr){
    return potArr instanceof Array;
  }
      
  $(window).bind('keydown', function(event){
    if (event.ctrlKey || event.metaKey) {
      switch (String.fromCharCode(event.which).toLowerCase()) {
        case 's':
          event.preventDefault();
          $scope.storeNotebook($scope.current);
          break;
      }
    }
  });
}])