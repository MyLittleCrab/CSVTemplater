<#
.SYNOPSIS
  PowerShell-версия CSV темплейтера

.ARGUMENTS
  -i  <csv файл>
  -t  <файл с шаблоном>
  -o  <файл с результатом>    [опционально] по умолчанию 'output.txt'
  -s  <разделитель>           [опционально] по умолчанию TAB
  -ie <кодировка csv>         [опционально] по умолчанию 'utf16-le'
  -oe <кодировка результата>  [опционально] по умолчанию 'win1251'
  -p  <файл с префиксом>      [опционально] если задан, текст из него добавляется в начало результата
#>
param(
    [string]$i,
    [string]$t,
    [string]$o = 'output.txt',
    [string]$s = "`t",
    [string]$ie = 'utf16-le',
    [string]$oe = 'win1251',
    [string]$p
)

$ErrorActionPreference = 'Stop'

function Get-DotNetEncoding {
    param([string]$Name)

    switch ($Name.Trim().ToLower()) {
        'utf16-le'     { return [System.Text.Encoding]::Unicode }
        'utf-16'       { return [System.Text.Encoding]::Unicode }
        'utf16be'      { return [System.Text.Encoding]::BigEndianUnicode }
        'utf-16be'     { return [System.Text.Encoding]::BigEndianUnicode }
        'utf8'         { return [System.Text.Encoding]::UTF8 }
        'utf-8'        { return [System.Text.Encoding]::UTF8 }
        'utf7'         { return [System.Text.Encoding]::UTF7 }
        'utf32'        { return [System.Text.Encoding]::UTF32 }
        'ascii'        { return [System.Text.Encoding]::ASCII }
        'latin1'       { return [System.Text.Encoding]::GetEncoding(28591) }
        'iso-8859-1'   { return [System.Text.Encoding]::GetEncoding(28591) }
        'win1251'      { return [System.Text.Encoding]::GetEncoding(1251) }
        'windows-1251' { return [System.Text.Encoding]::GetEncoding(1251) }
        'cp1251'       { return [System.Text.Encoding]::GetEncoding(1251) }
        default {
            if ($Name.Trim() -match '^(\d+)$') {
                return [System.Text.Encoding]::GetEncoding([int]$Matches[1])
            }
            try {
                return [System.Text.Encoding]::GetEncoding($Name.Trim())
            } catch {
                throw "Неизвестная кодировка: $Name"
            }
        }
    }
}

function Split-Record {
    param([string]$Line, [string]$Separator)

    return $Line.Split([string[]]@($Separator), [System.StringSplitOptions]::None)
}

# --- Разбор аргументов
$csvFile        = $i
$templateFile   = $t
$outputFile     = $o
$separator      = $s
$inputEncoding  = $ie
$resultEncoding = $oe
$prefixFile     = $p

if (-not $csvFile -or -not $templateFile) {
    Add-Type -AssemblyName System.Windows.Forms
    Add-Type -AssemblyName System.Drawing

    $script:guiResult = $null

    $form = New-Object System.Windows.Forms.Form
    $form.Text = "Настройки генерации"
    $form.Size = New-Object System.Drawing.Size(700, 430)
    $form.StartPosition = "CenterScreen"
    $form.FormBorderStyle = "FixedDialog"
    $form.MaximizeBox = $false

    $fields = @{}

    function Add-FilePickerRow {
        param(
            [string]$labelText,
            [int]$yPosition,
            [string]$defaultText = ""
        )

        $label = New-Object System.Windows.Forms.Label
        $label.Text = $labelText
        $label.Location = New-Object System.Drawing.Point(10, $yPosition)
        $label.AutoSize = $true
        $form.Controls.Add($label)

        $textbox = New-Object System.Windows.Forms.TextBox
        $textboxY = $yPosition - 3
        $textbox.Location = New-Object System.Drawing.Point(180, $textboxY)
        $textbox.Size = New-Object System.Drawing.Size(350, 20)
        $textbox.Text = $defaultText
        $form.Controls.Add($textbox)

        $button = New-Object System.Windows.Forms.Button
        $button.Text = "Обзор..."
        $button.Location = New-Object System.Drawing.Point(540, $textboxY)
        $button.Size = New-Object System.Drawing.Size(80, 23)

        $button.Add_Click({
            $dialog = New-Object System.Windows.Forms.OpenFileDialog
            $dialog.Filter = "Все файлы (*.*)|*.*"
            $dialog.Multiselect = $false
            if ($dialog.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {
                $textbox.Text = $dialog.FileName
            }
        }.GetNewClosure())

        $form.Controls.Add($button)
        return $textbox
    }

    function Add-TextRow {
        param(
            [string]$labelText,
            [int]$yPosition,
            [string]$defaultText = ""
        )

        $label = New-Object System.Windows.Forms.Label
        $label.Text = $labelText
        $label.Location = New-Object System.Drawing.Point(10, $yPosition)
        $label.AutoSize = $true
        $form.Controls.Add($label)

        $textbox = New-Object System.Windows.Forms.TextBox
        $textboxY = $yPosition - 3
        $textbox.Location = New-Object System.Drawing.Point(180, $textboxY)
        $textbox.Size = New-Object System.Drawing.Size(440, 20)
        $textbox.Text = $defaultText
        $form.Controls.Add($textbox)

        return $textbox
    }

    # --- Создаём поля ---
    $y = 20
    $fields.csvFile = Add-FilePickerRow -labelText "CSV файл с данными:" -yPosition $y -defaultText ""
    $y += 45

    $fields.csvEncoding = Add-TextRow -labelText "Кодировка CSV файла:" -yPosition $y -defaultText "utf16-le"
    $y += 45

    $fields.templateFile = Add-FilePickerRow -labelText "Файл с шаблоном:" -yPosition $y -defaultText ""
    $y += 45

    $fields.prefixFile = Add-FilePickerRow -labelText "Файл с префиксом:" -yPosition $y -defaultText ""
    $y += 45

    $fields.resultFile = Add-TextRow -labelText "Имя файла с результатом:" -yPosition $y -defaultText "output.txt"
    $y += 45

    $fields.resultEncoding = Add-TextRow -labelText "Кодировка результата:" -yPosition $y -defaultText "win1251"
    $y += 45

    $fields.delimiter = Add-TextRow -labelText "Разделитель:" -yPosition $y -defaultText "\t"
    $y += 50

    # --- Кнопки OK и Отмена ---
    $okButton = New-Object System.Windows.Forms.Button
    $okButton.Text = "OK"
    $okButton.Location = New-Object System.Drawing.Point(280, $y)
    $okButton.Size = New-Object System.Drawing.Size(100, 30)
    $okButton.Add_Click({
        $script:guiResult = @{
            csvFile        = $fields.csvFile.Text
            inputEncoding  = $fields.csvEncoding.Text
            templateFile   = $fields.templateFile.Text
            prefixFile     = $fields.prefixFile.Text
            outputFile     = $fields.resultFile.Text
            outputEncoding = $fields.resultEncoding.Text
            separator      = $fields.delimiter.Text
        }
        $form.Close()
    })
    $form.Controls.Add($okButton)

    $cancelButton = New-Object System.Windows.Forms.Button
    $cancelButton.Text = "Отмена"
    $cancelButton.Location = New-Object System.Drawing.Point(400, $y)
    $cancelButton.Size = New-Object System.Drawing.Size(100, 30)
    $cancelButton.Add_Click({
        $form.Close()
    })
    $form.Controls.Add($cancelButton)

    $form.ShowDialog() | Out-Null

    if ($script:guiResult) {
        $csvFile        = $script:guiResult.csvFile
        $templateFile   = $script:guiResult.templateFile
        $prefixFile     = $script:guiResult.prefixFile
        $outputFile     = $script:guiResult.outputFile
        $inputEncoding  = $script:guiResult.inputEncoding
        $resultEncoding = $script:guiResult.outputEncoding
        $separator      = $script:guiResult.separator
    }
}

if ($separator -eq '\t') {
    $separator = "`t"
}

if (-not $csvFile -or -not $templateFile) {
    Write-Host @'
Usage:
    -i <csv файл>
    -t <файл с шаблоном>
    [-o <файл с результатом>]     по умолчанию 'output.txt'
    [-s <разделитель>]            по умолчанию TAB
    [-ie <кодировка csv>]         по умолчанию 'utf16-le'
    [-oe <кодировка результата>]  по умолчанию 'win1251'
    [-p <файл с префиксом>]       опционально, добавляется в начало результата
'@
    exit 1
}

Write-Host "csvFile=$csvFile inputEncoding=$inputEncoding templateFile=$templateFile outputFile=$outputFile resultEncoding=$resultEncoding separator=$separator"

# --- Чтение входных данных
$csvText = [System.IO.File]::ReadAllText($csvFile, (Get-DotNetEncoding $inputEncoding))
$templateText = [System.IO.File]::ReadAllText($templateFile)

$csvContent = $csvText -split "`r?`n"

$csvHeader = @(Split-Record $csvContent[0] $separator) | ForEach-Object {
    ($_.Trim().Replace('"', '') -replace '\s+', '_').ToLower()
}

$csvRows = New-Object System.Collections.Generic.List[object]
foreach ($line in ($csvContent | Select-Object -Skip 1)) {
    $csvRows.Add(@(Split-Record $line $separator))
}

# --- Генерация строк
$outputLines = New-Object System.Collections.Generic.List[string]
foreach ($row in $csvRows) {
    if ($null -eq $row -or $row.Count -eq 0) {
        $outputLines.Add('')
        continue
    }

    $hasContent = $false
    foreach ($cell in $row) {
        if ($cell.Trim() -ne '') {
            $hasContent = $true
            break
        }
    }
    if (-not $hasContent) {
        $outputLines.Add('')
        continue
    }

    $outputLine = $templateText
    for ($index = 0; $index -lt $csvHeader.Count; $index++) {
        $placeholder = '{{' + $csvHeader[$index] + '}}'
        $value = ''
        if ($index -lt $row.Count) {
            $value = $row[$index].Trim().Replace('"', '')
        }
        $outputLine = $outputLine.Replace($placeholder, $value)
    }
    $outputLines.Add($outputLine)
}

$outputText = [string]::Join("`n", $outputLines)

if ($prefixFile) {
    if (-not (Test-Path -LiteralPath $prefixFile)) {
        throw "Не найден файл с префиксом: $prefixFile"
    }
    $prefixText = [System.IO.File]::ReadAllText($prefixFile)
    $outputText = $prefixText.TrimEnd("`r", "`n") + "`n" + $outputText
}

[System.IO.File]::WriteAllText($outputFile, $outputText, (Get-DotNetEncoding $resultEncoding))

Write-Host "Output written to $outputFile"
