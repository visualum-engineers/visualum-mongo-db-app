
const path = require("path");
const function_directories = require("../../functions/directories.json")
const check_root_functions = require("./utilities/check_root_functions")
const move_file = require("./utilities/move_file")

const main = async (
    function_directories = {}
) =>{
    const directories = Object.keys(function_directories)
    const function_dir = path.resolve(__dirname, "../../functions")
    for(let directory of directories){
        const curr_dir = path.join(function_dir, directory)
        const functions = await check_root_functions(curr_dir)
        //go through every function and move if in directories.json
        for(let func of functions){
            //remove .js ending
            const func_file_name = func.substring(0, func.length - 3)
            
            //move file to root if inside function directory map
            if(function_directories[directory][func_file_name]) await move_file({
                                        file_name: func_file_name,
                                        directory_des: function_dir,
                                        directory_start: directory,
                                        moveDeeper: false
                                    })
        }
    }    
}

main(function_directories)