$null = "test"
[void][Reflection.Assembly]::LoadWithPartialName(" System.Windows.Forms")
[void][Reflection.Assembly]::LoadWithPartialName("System.IO")
[void][Reflection.Assembly]::LoadWithPartialName("System.Drawing")
[Reflection.Assembly]::LoadWithPartialName("System.Convert")
[Reflection.Assembly]::LoadWithPartialName("System.Console")
[Reflection.Assembly]::LoadWithPartialName("System.BitConverter")
$stdin = [Console]::OpenStandardInput()
$stdout = [Console]::OpenStandardOutput()
$enc8 = [System.Text.Encoding]::UTF8
Function getMessage()
{
    $lengtgBytes = New-Object Byte[] 4
    $stdin.read($lengtgBytes,0,4) > $null
    $length = [BitConverter]::ToInt32($lengtgBytes,0)
    if($length -eq 0)
    {
        exit
    }
    $msgBytes = New-Object Byte[] $length
    $stdin.read($msgBytes,0,$length) > $null
    $message = $enc8.GetString($msgBytes)
    return $message
}
Function sendMessage($content)
{
    $jsonContent = ConvertTo-Json -InputObject $content
    $bytes = [BitConverter]::GetBytes([Convert]::ToUInt32($jsonContent.Length))
    #大端 小端？？？？？？
    #[Array]::Reverse($bytes) 
    #为了向外输出字节，使用$stdout
    $stdout.Write($bytes,0,$bytes.Length)
    #经过json的字符串，直接输出
    [Console]::Out.Write($jsonContent)
    [Console]::Out.Flush()
}
Function setImageToClipboard($base64String)
{
    #$base64String = "iVBORw0KGgoAAAANSUhEUgAAAJwAAACGCAIAAACnl3TnAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAQBSURBVHhe7dFbcuMwDETR7H/TGVd8UZEKlC1P9ACafb4SADJB9te3yXGoghyqIIcqyKEKcqiCHKoghyrIoQpyqIIcqiCHKsihCnKoghyqIIcqyKEKcqiCHKoghyrIoQpyqIIcqiCHKsihCnKoghyqILVQvwL/T0nq8uQZqM7HoQpyqIJ0bk6Sa/Qm41AFOVRBItcmwxEmZuJQBSncmfQ2MDQT/VAfmJuGYKjDylTaX5jcFnLxOTkPtVCHxYdnfRKaoT7wf6A6h963JbEFGg61LxILVH9QClTnIBvqA9VAdQKNr0pWCzQC1UB1AjqhUl2gEahOYKJQH2io63pPUlqgsUYvUFUnEirVhHagqm6uUB9oSGt5SfJZoDHCRKAqTSFUqhsYClSlTRfqAw1d/W5IMgs0tjEXqOpqHyrVlxgNVHUVuiFP/iE+fonRD/FxQyeuztucjMPeYfpMnFTAWatw0ZNx2A58cDIOu5tDPRKH3a1xqJy0G5+diZPuduIeXHQ3PiuDtXbjswLOXYXrJrQb4gIJ7Rqu2IZ7J7SbYOkRJsq4aCFun9Auj3UT2sVctxbPkNAujEUT2vVcuhmPkdAuiRUT2iXdsByvktAug7US2oXdsyLPk9AugIUS2rXdtiWPlNC+FasktMu7c1GeaoSJy3H8CBMd3L8rb5bQvhAHJ7T7KLExj5fQvgRHJrRbqbI0T5jQPhmHJbS7qbU3b5nQPgEHJLR7Krc9j5rQPhQ/ndBuq+IFeNqE9kH40YR2Z0XvwAOv0TsIP7pGr7nS1+ClA9WD8KOBqoS6l+GxF2gchB9doNFfm1CpHoqfDlT7c6i/qPbnUH9R7a/oTXjmQPUEHBCoNudQV6g251BXqDZX8Ro88AKNE3DAAo3OGoRKdR+++eQrPghUO5MKlQ8C1XeYDlQ7EwmV0REmtjEXqHZW7g487QKNbcxtY24bc4FqW9VDpbqBoR34YANDgWpbjUNl4hN8mdAOVNvqGirthPaOgSV6CzR6qrU9LxqortEbYSJQTWiv0QtUe2oWKo2EdkJ7hIlANVDtqU2olEaY2MZcQvsHpUC1p0Lb85wLNP6W6BPTI1sDz3pHdUOlup0H7d34bGQ48Cx2VDpU/hp5fvIf+D7Jred8R3VD3cL0H/BD7zDdUJXVech3mD4Cv/gSo910CpXR4/C725jrpkeoDJ2AAzYw1E2DUJk4EyeNMNFKiaV5v4T2JTgyod1K3VDpXYiD1+i1UjFUqjdhiUC1lSpL84Q1HpFVeib60HVve8GhCnKoghyqIIcqyKEKcqiCHKoghyrIoQpyqIIcqiCHKsihCnKoghyqIIcqyKEKcqiCHKoghyrIoQpyqIIcqiCHKuf7+x/81WsMFuCLiQAAAABJRU5ErkJggg=="
    $imageBytes = [System.Convert]::FromBase64String($base64String)
    $ms = [IO.MemoryStream]::new($imageBytes,0,$imageBytes.Length)
    $ms.Seek(0,[System.IO.SeekOrigin]::Begin)
    $img = [Drawing.Image]::FromStream($ms,$true,$true)
    $img.Save("f:\\save.jpg",[System.Drawing.Imaging.ImageFormat]::Jpeg)
    $null = [System.Windows.Forms.Clipboard]::SetImage($img)
    return "END"
}
#输出缓存区不可以出现任何其它系统错误、提示等等....字符串
#否则会影响浏览器对长度的读取，导致无法实现正常通信
#或许可以重定向powersdhell输出，让它正常输出到浏览器
while($true)
{
    $res = getMessage
    if($res -eq "testsignal")
    {
      sendMessage("testsignal from powershell")
    }
    else
    {
      $report = "NOT"
      if($res.length -ne 0){
        $res = ConvertFrom-Json -InputObject $res
        setImageToClipboard($res) > $report
      }
      sendMessage($res)
    }

}