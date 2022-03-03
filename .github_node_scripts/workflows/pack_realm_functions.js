const path = require("path");
const function_directories = require("../../functions/directories.json")
const move_file_deeper = require("./utilities/move_file")
const create_directories_map = require("./utilities/create_directories_map")
const check_root_functions = require("./utilities/check_root_functions")

const main = async (
    function_directories
) =>{
    const function_dir = path.resolve(__dirname, "../../functions")
    const root_functions = await check_root_functions(function_dir)
    if(root_functions.length === 0) return console.log("no root functions to move")

    //create combined all func map. 
    //we know that each func name should be unique
    //we store the directory the func belongs to as a value
    const combined_map = create_directories_map(function_directories)
    
    //run check for each function
    for (let root_func of root_functions){
        //remove .js ending
        const func_file_name = root_func.substring(0, root_func.length - 3)

        //look up function name
        if(func_file_name in combined_map) await move_file_deeper({
            file_name: func_file_name,
            directory_des: combined_map[func_file_name],
            directory_start: function_dir
        })
    }
}

main(function_directories)