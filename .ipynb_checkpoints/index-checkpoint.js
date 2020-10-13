var RSNBApp = angular.module('RSNBApp', []);

var RSNBController = RSNBApp.controller("RSNBController", ["$scope", "$http", "$sce", function($scope, $http, $sce){
  $scope.notebooks = []
  $scope.current = null;
    
  // https://stackoverflow.com/a/10080841
  $("textarea").keyup(function(e) {
    while($(this).outerHeight() < this.scrollHeight + parseFloat($(this).css("borderTopWidth")) + parseFloat($(this).css("borderBottomWidth"))) {
        $(this).height($(this).height()+1);
    };
  });
  
  $scope.storeNotebook = function(notebook){
      window.localStorage.setItem(notebook.name, JSON.stringify(notebook));
  }
    
  $scope.loadNotebooks = function(){
      var notebookNames = Object.keys(window.localStorage);
      for(var name of notebookNames){
          var notebook = JSON.parse(localStorage.getItem(name));
          $scope.notebooks.push(notebook)
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
       "mimetype": "text/javascript",
       "name": "javascript",
       "version": "1.0.0"
      }
     },
     "nbformat": 4,
     "nbformat_minor": 4
    };  
      
    $scope.storeNotebook(notebook);
    $scope.notebooks.push(notebook);
  }

  $scope.removeNotebook = function(notebook){
    window.localStorage.removeItem(notebook.name)
    $scope.notebooks = $scope.notebooks.splice($scope.notebooks.indexOf(notebook), 1);
  }
  
  $scope.display = function(notebook){
    $scope.current = notebook;
  }
    
  $scope.run = function(cell, code){
    cell.source = code.split('\n')
    var result = window.eval(code);
    cell.output = [result];
    cell.execution_count = cell.execution_count === null ? 0 : cell.execution_count + 1;
    return result;
  }
    
  $scope.runAll = function(notebook){
    notebook.cells = notebook.cells.map(function(cell){
      $scope.run(cell, cell.cellSource);
      return cell;
    });
  }
    
  $scope.clearAll = function(notebook){
    notebook.cells.forEach(cell => cell.source = [''])
  }

  $scope.downloadNotebook = function(notebook){
    notebook.cells = notebook.cells.map(cell => {
      cell.source = cell.cellSource.split(/\r?\n/);
      return cell;
    })
    var text = JSON.stringify(notebook);
    download(text, `${notebook.name}${notebook.name.endsWith('.es.ipynb') ? '' : '.es.ipynb'}`, 'text')
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

}])