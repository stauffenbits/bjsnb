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
      var nb = Object.assign({}, notebook)
      nb.cells = nb.cells.map((cell, i) => {
        switch(cell.cell_type){
        case 'markdown':
          cell.source = (cell.editor ? cell.editor.codemirror.getValue().split(/\n/) : cell.cellSource.split(/\n/));
          if(cell.editor){
            delete cell.editor;
          }
          break;
        case 'code':
          cell.source = cell.cellSource !== undefined ? cell.cellSource.split(/\n/) : cell.source;
          if(cell.cellSource){
            delete cell.cellSource;
          }
          break;
        }
        return cell;
      })
      window.localStorage.setItem(notebook.name, JSON.stringify(notebook));
  }
      
  $scope.initMarkdownCell = function(nbIndex, cellIndex){
    var elem = document.querySelector(`.notebook${nbIndex} * .cell${cellIndex}`);
    if(!elem) return;
      
    var cell = $scope.notebooks[nbIndex].cells[cellIndex];
    cell.cellSource = cell.source.join('\n'); 
    
    if(!cell.editor){
      cell.editor = new Editor({lineWrapping: true});
    }
      
    cell.editor.render(document.querySelector(`.notebook${nbIndex} * .markdown.cell${cellIndex}`));
    cell.editor.codemirror.setValue(cell.cellSource || '');
  }
      
  $scope.initAllMarkdownCells = function(notebook){
    if(!notebook.index){
      notebook.index = $scope.notebooks.indexOf(notebook);
    }
      
    for(var i=0; i<notebook.cells.length; i++){
      $scope.initMarkdownCell(notebook.index, i)
    }
  }
      
  $scope.display = function(notebook){
    if(!notebook) return;
    $scope.current = notebook;
  }
    
  $scope.loadNotebooks = function(){
    $scope.notebooks = [];
    var notebookNames = Object.keys(window.localStorage);
    notebookNames.forEach((name, i) => {
      var notebook = JSON.parse(localStorage.getItem(name));
      if(!notebook) return;
      $scope.notebooks.push(notebook);
    })
    
    var notebooks = $scope.notebooks;
      
    for(var i=0; i<notebooks.length; i++){
      $scope.initAllMarkdownCells(notebooks[i])
    }
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
      
    $scope.storeNotebook(notebook);
    $scope.notebooks.push(notebook);
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
      
  $(window).bind('keydown', function(event) {
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