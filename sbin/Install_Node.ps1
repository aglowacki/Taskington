$node_ver='v8.5.0'
$node_zip='node-'+$node_ver+'-win-x64.zip'
$weburl='https://nodejs.org/dist/'+$node_ver+'/'+$node_zip
$install_dir='c:\Apps'
(New-Object Net.WebClient).DownloadFile($weburl,$node_zip);(new-object -com shell.application).namespace($install_dir).CopyHere((new-object -com shell.application).namespace($install_dir+'\'+$node_zip).Items(),16)