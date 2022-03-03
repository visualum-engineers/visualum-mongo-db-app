const create_directories_map = (function_directories) =>{
    const directories = Object.keys(function_directories)
    const combined_map = {}
    for(let directory of directories){
        const function_map = function_directories[directory]
        Object.keys(function_map).forEach(key => {
            if(function_map[key]) {
                if(combined_map[key]) throw console.error(
                        `Duplicate function names. Please adjust directories.json for function: ${key}, in directory: ${directory}`
                    )
                combined_map[key] = directory
            }
        })
    }
    return combined_map
}

module.exports = create_directories_map