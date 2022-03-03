# Cloud Realm functions sub directory structure is here
## Important Warnings
---
1. ```functions_directories.json``` must always live here. Changing this will cause breaking changes to github repo, and cloud functions will not be recognized by Mongo DB Realm. This is due to Mongo DB Realm's own strict directory structure.

2.  If you want to make a sub-directory to hold a collection of functions, you MUST add the following to the ```functions_directories.json``` file. The reasons are listed below: 
    1. Mongo DB Realm does *NOT* recognize any functions inside of a sub-directory. 
    2. If all our functions lived in our root repo, it would be a nightmare to maintain.
    
    ##### Solution: To get around this restriction, the following two things happen: 

    1. When a developer *initiates a pull request*, all the cloud functions are packed and organizated according to the ```functions_directories.json``` file. 
    
    2. When a developer *pushs their code to the repo*, AFTER ensuring all function names are *unique*, the functions are unpacked from their sub-directories into the *root functions directory*, for Mongo DB Realm to use. 

3. Mongo DB Realm's documentation may suggest that you can call a function by using its string path. However, this only applies when a CI/CD pipeline is not setup and all functions are created through Realm's UI. This is not the case here. 
    * Since all functions are unpacked to the root functions directory, when calling a function inside another, you should only use the name of the function being called (not the string path to it). All functions are ensured to be unique.

## Using directories.json
---
1. Every key in ```functions_directories.json``` represents the name of the sub-directory. The key MUST match the sub-directory name *EXACTLY*. 

2. Every key value is a map/object, that holds the *names of all functions* in that sub-directory. This is to keep lookup times fast during checks. 
    * Setting the function name value to ```false```, will cause the function to be ignored from Mongo DB Realm and all checks. 
    * Setting the function name value to  ```true```, will cause the function to be unpacked for Mongo DB Realm Use
3. Currently the ```functions_directories.json``` structure, and workflows only support 1 level of sub-directories. Adding functions to nested sub-directories, is not currently supported by the workflow functions. If needed, you must edit all workflow scripts using ```functions_directories.json``` to accomadate for this. 




