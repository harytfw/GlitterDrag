$file = Get-ChildItem -Exclude [*.zip,*.ps1]
Compress-Archive -DestinationPath ext.zip -Path $file -Force