exports = async function({
  query_condition = {},
  update_users = [],
  update_content = {},
  update_many = false
}){
  const user_collection = context.services.get("mongodb-atlas").db("Development").collection("users");
  const user_id = context.user.id
  const update_many_users = async (users = []) =>{
    //protect against updating entire collection
    if(Object.keys(query_condition).length <= 0) return {
      error: true, message: "you do not have access to update these users"
    }
    try{
        await user_collection.update_many(
          {
            ...query_condition, 
            _id: {$in: users},
          },
          update_content
        )
        return {error: null, message: `successfully updated users: ${users}`}
    } 
    catch(e){
      const error = new Error(`could not update users: ${users}`)
      error.metadata = e
      throw error
    }
  }

  const update_one_user = async() =>{
    try{
        await user_collection.updateOne(
          {
            ...query_condition, 
            _id: user_id,
          }
          ,
          update_content
        )
        return {error: null, message: `successfully updated user: ${user_id}`}
    }
    catch(e){
        const error = new Error("could not create a new user")
        error.metadata = e
        throw error
    }
  }

  //_main_
  try{
    let response
    if(update_many) response = await update_many_users(update_users)
    else response = await update_one_user()
    
    return response
  }
  catch(e){
    return {error: e, message: "something went wrong. could not update relevant user data"}
  }
};
