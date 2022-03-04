
  exports = async function(){
    const user_collection = context.services.get("mongodb-atlas").db("Development").collection("users");
    const user_id = context.user.id;
  
    try{
        const user = await user_collection.findOne({_id: user_id})
        //find classes. if they're the only teacher in it
        //remove the class and all respective data
        //there should only be one, but to ensure clean up, we loop through
        //if neither exists, we can just delete user document
        if(!user.classes || user.account_type === "student") {
            return await user_collection.deleteOne({_id: user_id})
        }
        const delete_params = {
            delete_query: {teachers: [user_id]}, 
            delete_many: true
        } 
        const update_params = {
            update_query: {
              teachers: { 
                $all:[user_id]
              },
              teacher_arr_size: {
                $gt: 1,
              }
            },
            update_many: true
        }

        const delete_many = await context.functions.execute("classes/delete_class", delete_params)
        const update_many = await context.functions.execute("classes/update_class", update_params)
        if(delete_many.error) return {error: delete_many, message: "could not delete classes"}
        if(update_many.error) return {error: update_many, message: "could not update classes"}
        
        //delete user
        await user_collection.deleteOne({_id: user_id})
    } catch(e){
      return {error: e, message: "could not delete user"};
    }
  
    return {error: null, message: "user and associated data successfully deleted"};
  };
    