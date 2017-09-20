# Taskington
Task submission web portal


### Install Notes
#### Windows 
##### python-ldap download http://www.lfd.uci.edu/~gohlke/pythonlibs/#python-ldap
###### wheel install python_ldap-2.4.44-cp27-cp27m-win_amd64.whl
##### conda install cherrypy routes
##### .\sbin\Install_node.ps1  (and add c:\apps\node_install_dir to path)
##### cd ngApp
##### npm install
##### ng build --target=production --environment=prod --base-href=/static/ --output-path=../public