const mv = require("mv");
const fs = require("fs")
const fsPromises = fs.promises;
const path = require("path");
const move_file = async ({
    file_name="",
    directory_start="",
    directory_des ="",
    moveDeeper = true
}) =>{
    let curr_path = path.join(directory_start,`${file_name}.js`)
    let destination = path.join(directory_start, directory_des, `${file_name}.js`)
    let destination_folder = path.join(directory_start, directory_des)
    if(!moveDeeper){
        curr_path = path.join(directory_des, directory_start,`${file_name}.js`)
        destination = path.join(directory_des, `${file_name}.js`)
        destination_folder = path.join(directory_des)
    }
    try{
        //create folder if it doesnt exist
        if(!fs.existsSync(destination_folder)){
            await fsPromises.mkdir(destination_folder)
        }

        //move file
        mv(curr_path, destination, function(err){
            if(err){
                throw err
            } else{
                console.log(`successfully moved ${file_name}`)
            }
        })

    } catch(e){
        console.error(e)
    }
}
module.exports = move_file