# CSVtemplater

A utility for generating text from a CSV file using a template. The script reads a CSV table, replaces template tags like `{{column_name}}` with values from each row, and writes the result to an output file.

## How it works

- Reads a CSV file and a template file.
- The first line of the CSV is used as the header; column names are normalized by replacing spaces with `_`, removing quotes, and converting to lowercase.
- Each CSV row is applied to the template: `{{column_name}}` is replaced with the corresponding value.
- The result is written to the output file.

## Arguments

```
csv_file template_file [output_file] [separator]
```

- `csv_file` — the name of the CSV file.
- `template_file` — the name of the template file.
- `output_file` — the name of the output file (default is `output.txt`).
- `separator` — the CSV field separator (default is tab `\t`).

## Template example

`template.txt` file:

```
Name: {{name}}
Email: {{email}}
City: {{city}}
---
```

## CSV example

`data.csv` file:

```
name\temail\tcity
Ivan Ivanov\tivan@example.com\tMoscow
Olga Petrova\tolga@example.com\tSaint Petersburg
```

If you use semicolon or comma separators, pass the desired separator as the fourth argument.

## Run example

```
qjs main.js data.csv template.txt result.txt "\t"
```

Or, if you want to use `;` as a separator:

```
qjs main.js data.csv template.txt result.txt ";"
```

## Result

The `result.txt` file will contain:

```
Name: Ivan Ivanov
Email: ivan@example.com
City: Moscow
---
Name: Olga Petrova
Email: olga@example.com
City: Saint Petersburg
---
```

## Features

- Empty lines in the CSV are ignored.
- If a tag value is missing, the template retains an empty string for that placeholder.
- The template can contain any other text or characters.

## Requirements

- QuickJS with support for the `qjs:std` module.
- Run the script with `qjs main.js ...`.

---

# CSVtemplater

Утилита для генерации текста из CSV-файла по шаблону. Скрипт читает CSV-таблицу, заменяет в шаблоне метки `{{имя_столбца}}` значениями из каждой строки и записывает результат в выходной файл.

## Как работает

- Читает CSV-файл и шаблонный файл.
- Первая строка CSV используется как заголовок, имена столбцов нормализуются: пробелы заменяются на `_`, кавычки удаляются, буквы приводятся к нижнему регистру.
- Каждая строка CSV применяется к шаблону: `{{column_name}}` заменяется соответствующим значением.
- Результат записывается в выходной файл.

## Аргументы

```
csv_file template_file [output_file] [separator]
```

- `csv_file` — имя CSV-файла.
- `template_file` — имя шаблонного файла.
- `output_file` — имя выходного файла (по умолчанию `output.txt`).
- `separator` — разделитель полей в CSV (по умолчанию табуляция `\t`).

## Пример шаблона

Файл `template.txt`:

```
Имя: {{name}}
Email: {{email}}
Город: {{city}}
---
```

## Пример CSV

Файл `data.csv`:

```
name\temail\tcity
Иван Иванов\tivan@example.com\tМосква
Ольга Петрова\tolga@example.com\tСанкт-Петербург
```

Если используется точка с запятой или запятая, передайте нужный разделитель как четвертый аргумент.

## Пример запуска

```
qjs main.js data.csv template.txt result.txt "\t"
```

Или, если вы хотите использовать разделитель `;`:

```
qjs main.js data.csv template.txt result.txt ";"
```

## Результат

В файле `result.txt` будет:

```
Имя: Иван Иванов
Email: ivan@example.com
Город: Москва
---
Имя: Ольга Петрова
Email: olga@example.com
Город: Санкт-Петербург
---
```

## Особенности

- Пустые строки в CSV игнорируются.
- Если значение для метки отсутствует, в шаблоне остается пустая строка.
- Шаблон может содержать любые другие символы и текст.

## Требования

- QuickJS с поддержкой модуля `qjs:std`.
- Скрипт запускается командой `qjs main.js ...`.
