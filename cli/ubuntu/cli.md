# Ubuntu CLI Cheat Sheet

## File & Directory
- `ls` – list files  
- `ls -la` – include hidden + details  
- `cd <dir>` – change directory  
- `pwd` – current path  
- `mkdir <name>` – create folder  
- `rm <file>` – delete file  
- `rm -rf <dir>` – delete folder (force)  
- `cp a b` – copy  
- `mv a b` – move/rename  

---

## File Viewing
- `cat file` – print file  
- `less file` – scroll view  
- `head -n 10 file`  
- `tail -f log.txt` – live logs  

---

## Process & System
- `ps aux` – list processes  
- `top` / `htop` – monitor  
- `kill <pid>`  
- `kill -9 <pid>` – force  

> Uses signals like `SIGTERM`, `SIGKILL`.

---

## Networking
- `ip a` – show IP  
- `ping google.com`  
- `curl <url>` – HTTP request  
- `ss -tuln` – open ports  

---