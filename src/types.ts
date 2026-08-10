export interface AppArguments {
  csvFile: string | null;
  templateFile: string | null;
  outputFile: string;
  separator: string;
  inputEncoding: string;
  outputEncoding: string;
}
