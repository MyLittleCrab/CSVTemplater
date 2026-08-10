/**
 * Arguments:
 * first = filename of csv file
 * second = filename of template file
 * third [optional] = output filename (default is 'output.txt')
 * fourth [optional] = separator for csv file (default is '\t')
 */

import * as std from 'qjs:std';

const argIndexes = {
  csvText: 0,
  templateText: 1,
  outputFile: 2,
  separator: 3
};

if (!argv0.includes("templater")) {
  // increment indexes if the script is run as a module
  Object.keys(argIndexes).forEach(key => {
    argIndexes[key]++;
  });
}

const csvText = std.loadFile(scriptArgs[argIndexes.csvText]);
const templateText = std.loadFile(scriptArgs[argIndexes.templateText]);

const outputFile = scriptArgs[argIndexes.outputFile] || 'output.txt';
const separator = scriptArgs[argIndexes.separator] || '\t';

const csvContent = csvText.split('\n');
const csvHeader = csvContent[0]
  .split(separator)
  .map(header => header.trim().replace(/"/g, '').replace(/\s+/g, '_').toLowerCase());

const csvRows = csvContent.slice(1).map(row => row.split(separator));

const outputLines = csvRows.map(row => {
  if (row.length === 0) {
    return '';
  }

  if (row.every(value => value.trim() === '')) {
    return '';
  }

  let outputLine = templateText;
  csvHeader.forEach((header, index) => {
    const value = row[index] || '';
    outputLine = outputLine.replaceAll(`{{${header}}}`, value.trim().replace(/"/g, ''));
  });
  return outputLine;
});

std.writeFile(outputFile, outputLines.join('\n'));

console.log(`Output written to ${outputFile}`);