## Claude just need to know:
1. functions name that get data
2. the input 
3. the output
--> read permission for contracts folder

## Claude not need to know:
1. endpoints
2. fetch interceptor.
--> deny permission for folders: clients, lib

## Where to get input and output.
1. Read backend DTOs (src/Modules/<ModuleName>/DTOs/*.cs) # Most cases --> read permission
2. Read from handoff document from codex