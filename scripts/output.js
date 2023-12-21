const fs = require('fs');
const path = require('path');
var graphviz = require('graphviz');


function writeOutputFile(dir, fileName, taintObjects, taintLineNumbers, taintEdges) {
  var outputString = 'Taint objects:\n';
  for (var obj of taintObjects) {
    outputString += `[scope: ${obj.scopeName}, var: ${obj.variable}]\n`;
  }

  outputString += '\n';
  outputString += 'Taint lines:\n';
  
  var count = 0;
  for (var lineNumber of taintLineNumbers) {
    if (count > 0) {
      if (count % 8 == 0) {
        outputString += ',\n';
      } else {
        outputString += ', ';
      }
    }
    outputString += lineNumber;
    count++;
  }

  outputString += '\n\nTaint edges:\n';

  for (var edge of taintEdges) {
    var source = edge.source;
    var target = edge.target;

    outputString += `[(${source.scopeName}) ${source.variable}, ${source.position.line}:${source.position.column}]` +
      ` -> [(${target.scopeName}) ${target.variable}, ${target.position.line}:${target.position.column}]\n`;
  }

  fs.writeFileSync(path.join(dir, fileName + '-result.txt'), outputString);
}


function writeTaintGraphDot(dir, fileName, taintObjects, taintEdges) {
  // Create digraph G
  var g = graphviz.digraph('G');

  var scopeNamesAndClustersMap = new Map();
  var variablesAndNodesMap = new Map();

  for (var obj of taintObjects) {
    if (!scopeNamesAndClustersMap.has(obj.scopeName)) {
      var scopeClusterName = obj.scopeName.replace('#', '_');

      // var cluster = g.addCluster('cluster_' + scopeClusterName);
      var cluster = g.addCluster(scopeClusterName);

      cluster.set('label', 'Scope [' + scopeClusterName + ']');
      scopeNamesAndClustersMap.set(obj.scopeName, cluster);
    }

    var cluster = scopeNamesAndClustersMap.get(obj.scopeName);

    if (!variablesAndNodesMap.has(obj.variable)) {
      // var node = cluster.addNode(`${obj.variable}`);
      var node = cluster.addNode(`[scope: ${obj.scopeName}]\n${obj.variable} (${obj.position.line},${obj.position.column})`);
      variablesAndNodesMap.set(obj.variable, node);
    }
  }

  for (var edge of taintEdges) {
    var source = edge.source;
    var target = edge.target;
    var sourceNode = variablesAndNodesMap.get(source.variable);
    var targetNode = variablesAndNodesMap.get(target.variable);

    g.addEdge(sourceNode, targetNode);
  }

  fs.writeFileSync(path.join(dir, fileName + '-result.dot'), g.to_dot());
}


module.exports = {
  writeOutputFile,
  writeTaintGraphDot,
}
