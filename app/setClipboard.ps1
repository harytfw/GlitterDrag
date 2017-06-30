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
    $imageBytes = [System.Convert]::FromBase64String($base64String)
    $ms = [IO.MemoryStream]::new($imageBytes,0,$imageBytes.Length)
    $ms.Seek(0,[System.IO.SeekOrigin]::Begin)
    $img = [Drawing.Image]::FromStream($ms,$true,$true)
    #$img.Save("f:\\save.jpg",[System.Drawing.Imaging.ImageFormat]::Jpeg)
    $null = [System.Windows.Forms.Clipboard]::SetImage($img)
    return "END"
}
#输出缓存区不可以出现任何其它系统错误、提示等等....字符串
#否则会影响浏览器对长度的读取，导致无法实现正常通信
#或许可以重定向powersdhell输出，让它正常输出到浏览器
while($true)
{
    $res = getMessage
    $res = ConvertFrom-Json -InputObject $res
    if($res -eq "test")
    {
      sendMessage("reply from powershell")
    }
    else
    {
      if($res.length -ne 0){
        $null = setImageToClipboard($res)
      }
      sendMessage("Finished")
    }

}