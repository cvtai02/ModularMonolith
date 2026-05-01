## Claude just need to know:
abstraction that work with apis include:
1. method
2. the input 
3. the output
--> read permission for contracts folder

## Claude not allow to know:
1. endpoints
2. fetch interceptor.
3. abstraction implementation
--> deny permission for folders: clients, lib

## Where to get input and output.
1. Read backend DTOs (src/Modules/<ModuleName>/DTOs/*.cs) # Most cases --> read permission
2. Read from handoff document from codex