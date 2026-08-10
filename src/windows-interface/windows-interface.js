export default `
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$form = New-Object System.Windows.Forms.Form
$form.Text = "Настройки генерации"
$form.Size = New-Object System.Drawing.Size(700, 380)
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
    $result = @{
        csvFile       = $fields.csvFile.Text
        inputEncoding   = $fields.csvEncoding.Text
        templateFile  = $fields.templateFile.Text
        outputFile    = $fields.resultFile.Text
        outputEncoding = $fields.resultEncoding.Text
        separator     = $fields.delimiter.Text
    }
    $json = $result | ConvertTo-Json -Compress
    $json | Out-File -FilePath "./interface_response.json" -Encoding UTF8
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
`;