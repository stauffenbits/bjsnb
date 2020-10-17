var RSNBApp = angular.module('RSNBApp', ['ui.codemirror']);

var RSNBController = RSNBApp.controller("RSNBController", 
  ["$scope", "$http", "$sce", "$element", "$document",
  function($scope, $http, $sce, $element, $document){
  $scope.notebooks = [];
  $scope.current = null;
  $scope.currents = [];
      
  $scope.reservedNames = [
    'initialized', 
  ];
      
  $scope.newline = '\n';
    
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
      var cellCopy = Object.assign({}, cell)
      Object.assign(cellCopy, {
        editor: null, 
        cellSource: null
      });
        
      // ! is there enough information here to justify the following line of code? 
      // I am trying to decide which array is newer, without knowing which on is. 
      cellCopy.source = cell.cellSource ? cell.cellSource.split($scope.newline) : cell.source;
      
      if(!cellCopy.source) cellCopy.source = [];
      cellCopy.source = cellCopy.source.map(line => {
        if(!line.endsWith('\n')){
          return `${line}\n`;
        }else{
          return line;
        }
      });
      delete cellCopy.cellSource;
      delete cellCopy.index;
      delete cellCopy.editor;
      delete cellCopy.execution_count;
      delete cellCopy.visualization;
      cellCopy.outputs = [];
        
      return cellCopy;
    });
      
    delete nb.index;
    var name = notebook.name;
    
    console.log(nb);
    window.localStorage.setItem(name, JSON.stringify(nb));
  }
      
  $scope.initCodeCell = function(nbIndex, cellIndex){
      
    var elem = document.querySelector(`.notebook${nbIndex} .code.cell${cellIndex}`);
    if(!elem) return;
      
    var cell = $scope.notebooks[nbIndex].cells[cellIndex];
    if(!cell) return;
      
    if(cell.editor){
      cell.editor.codemirror.getWrapperElement().remove();
      delete cell.editor;
      delete cell.editorOptions;
    }
      
    if(!cell.editor){
      cell.editorOptions = {
        mode:  "javascript",
        lineNumbers: true
      }
      cell.editor = {
        codemirror: CodeMirror.fromTextArea(elem, cell.editorOptions)
      };
    }

    cell.editor.codemirror.setValue(cell.source.join(''));
    cell.editor.codemirror.setOption('theme', 'eclipse');
    cell.cellSource = cell.source.join('')

    return cell;
  }
      
  $scope.initMarkdownCell = function(nbIndex, cellIndex){
    var elem = document.querySelector(`.notebook${nbIndex} .markdown.cell${cellIndex}`);
    if(!elem) return;
      
    var cell = $scope.notebooks[nbIndex].cells[cellIndex];
    if(!cell) return;
      
    if(cell.editor){
      cell.editor.codemirror.getWrapperElement().remove();
      delete cell.editor;
      delete cell.editorOptions;
    }
    
    if(!cell.editor){
      cell.editorOptions = {
        lineWrapping: true,
        mode: 'markdown'
      };
      cell.editor = new Editor(cell.editorOptions);
    }
      
    cell.editor.render(document.querySelector(`.notebook${nbIndex} .markdown.cell${cellIndex}`));
    cell.editor.codemirror.setValue(cell.source.join(''));
    cell.editor.codemirror.refresh();
    cell.cellSource = cell.source.join('')
    
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

  $scope.initAllCodeCells = function(notebook){
    if(!notebook.index){
      notebook.index = $scope.notebooks.indexOf(notebook);
    }
      
    for(var i=0; i<notebook.cells.length; i++){
      $scope.initCodeCell(notebook.index, i);
    }
  }
      
  $scope.display = function(notebook){
    if(!notebook) return;
    $scope.current = notebook;
    $scope.currents = [$scope.current]
    // $scope.initAllMarkdownCells(notebook);
    // $scope.initAllCodeCells(notebook)
  }

  $scope.loadNotebooks = function(){
    $scope.notebooks = [];
    
      
    var notebookNames = Object.keys(window.localStorage).filter(name => {
      return $scope.reservedNames.indexOf(name) === -1; 
    });
    for(var i=0; i<notebookNames.length; i++){
      var notebook = JSON.parse(localStorage.getItem(notebookNames[i]));
      if(!notebook) return;
      $scope.notebooks.push(notebook);
    }
    
    if($scope.notebooks.length){
      $scope.display($scope.notebooks[0])
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
      "kernel_info": {
       "name": "Javascript (Browser)"
      },
      "language_info": {
        "name" : "Javascript",
        "version": "262",
        "codemirror_mode": "javascript"
     },
     "nbformat": 4,
     "nbformat_minor": 4
    };  
      
    notebook.name = name;
      
    $scope.notebooks.push(notebook);
    // $scope.initAllMarkdownCells(notebook);
    // $scope.initAllCodeCells(notebook);

    $scope.storeNotebook(notebook);
    $scope.display(notebook);
  }

  $scope.removeNotebook = function(notebook){
    window.localStorage.removeItem(notebook.name);
    $scope.current = null;
    $scope.loadNotebooks();
  }
    
  $scope.run = function(cell, code){
    if(cell.cell_type != 'code') return;
    cell.source = code.split($scope.newline);
    var result = window.eval(code);
      
    var output = {
      "output_type" : "application/json",
      "execution_count": 42,
      "data" : result,
      "metadata": {}
    };
      
    cell.outputs = [output];
    cell.execution_count = cell.execution_count === null ? 0 : cell.execution_count + 1;
    return result;
  }

  $scope.getOutput = function(cell){
    return cell.outputs.length ? cell.outputs[0].data : undefined;
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
    notebook.cells = notebook.cells.map(cell => {
      cell.source = [];
      return cell;
    })
  }

  $scope.downloadNotebook = function(notebook){
    download(localStorage.getItem(notebook.name), `${notebook.name}${notebook.name.endsWith('.es.ipynb') ? '' : '.es.ipynb'}`, 'application/x-ipynb+json')
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
      
  $scope.addCellAt = function(notebook, i){
    notebook.cells.splice(i, 0, {
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
      
  $scope.isVega = function(potVega){
    if(!potVega) return false;
    return Object.keys(potVega).indexOf('$schema') > -1;
  }
      
  $scope.visualize = function(cell){
    if($scope.isVega($scope.getOutput(cell)))
    vegaEmbed(`.output${cell.index}`, $scope.getOutput(cell)).then(result => {
      cell.visualization = result;
    })
  }
      
  $scope.hideVisualiation = function(cell){
    if(cell.visualization){
    
    }
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
      
  this.$onInit = function(){
    if(!window.localStorage.getItem('initialized')){
      $http.get('Greetings.es.ipynb', {})
      .then(response => {
        var notebook = response.data;
        $scope.storeNotebook(notebook);
        $scope.loadNotebooks();
      });
    
      window.localStorage.setItem('initialized', true);
    }
      
    // $scope.notebooks.forEach((notebook, i) => {
    //  $scope.initAllCodeCells(notebook);
    //  $scope.initAllMarkdownCells(notebook);
    // })
  }
}])