/**
 * Arguments:
 * -i <csv filename>
 * -t <template filename>
 * -o <output filename> [optional] default 'output.txt'
 * -s <separator> [optional] default '\t'
 * -ie <encoding of csv file> [optional] (iconv.Encoding) default 'utf16-le'
 * -oe <encoding of output file> [optional] (iconv.Encoding) default 'win1251'
 * RUNTIME = QuickJS
 */

import * as std from 'qjs:std';
import * as os from 'qjs:os';
import { Buffer } from 'buffer';
import iconv from 'iconv-lite';

globalThis.Buffer = Buffer;

function parseArguments() {
  let csvFile = null;
  let templateFile = null;
  let outputFile = 'output.txt';
  let separator = '\t';
  let inputEncoding = 'utf16-le';
  let outputEncoding = 'win1251';

  for (let i = 0; i < scriptArgs.length; i++) {
    const arg = scriptArgs[i];

    if (arg === '-i') {
      csvFile = scriptArgs[++i];
    } else if (arg === '-t') {
      templateFile = scriptArgs[++i];
    } else if (arg === '-o') {
      outputFile = scriptArgs[++i];
    } else if (arg === '-s') {
      separator = scriptArgs[++i];
    } else if (arg === '-ie') {
      inputEncoding = scriptArgs[++i];
    } else if (arg === '-oe'){
      outputEncoding = scriptArgs[++i];
    }
  }
  return { csvFile, templateFile, outputFile, separator, inputEncoding, outputEncoding };
}

function readFileToBuffer(filename) {
  let fd = os.open(filename, os.O_RDONLY);
  if (fd < 0) throw new Error('Не удалось открыть файл');

  let size = os.seek(fd, 0, std.SEEK_END);
  os.seek(fd, 0, std.SEEK_SET);

  let buffer = new ArrayBuffer(size);
  let bytesRead = os.read(fd, buffer, 0, size);
  os.close(fd);
  return buffer;
}

function decodeText(buffer, encoding) {
  let text = iconv.decode(buffer, encoding);
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

function main() {

  const { csvFile, templateFile, outputFile, separator, inputEncoding, outputEncoding } = parseArguments();

  if (!csvFile || !templateFile) {
    const usage = `Usage:
        -i <csv file>
        -t <template file>
        [-o <output file>]
        [-s <separator> default '\\t']
        [-ie <input encoding> default 'UTF16LE']
        [-oe <output encoding> default 'win1251']`;
    console.log(usage);
    return;
  }

  const csvText = decodeText(readFileToBuffer(csvFile), inputEncoding);
  const templateText = std.loadFile(templateFile);

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

  std.writeFile(outputFile, iconv.encode(outputLines.join('\n'), outputEncoding));

  console.log(`Output written to ${outputFile}`);
}


main();