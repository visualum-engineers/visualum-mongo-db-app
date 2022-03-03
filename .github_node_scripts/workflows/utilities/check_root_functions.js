const fs = require("fs")
const fsPromises = fs.promises;
const check_root_functions = async (directory) => {
    try {
        const file_names = await fsPromises.readdir(directory);
        const functions = file_names.filter(file => {
            //match files that end in .js
            let regex = /.js$/ 
            return regex.test(file)
        });
        return functions
    } catch(err){
        console.error(`error occured while reading ${directory}`)
        return []
    }
}
module.exports = check_root_functions