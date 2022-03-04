exports = async function({
  query_condition = {},
  update_users = [],
  update_content = {},
  update_many = false
}){
  const user_collection = context.services.get("mongodb-atlas").db("Development").collection("users");
  const user_id = context.user.user_id
  const update_many_users = async (users = []) =>{
    //protect against updating entire collection
    if(Object.keys(query_condition).length <= 0) return {
      error: true, message: "you do not have access to update these users"
    }
    await user_collection.update_many(
      {
        ...query_condition, 
        _id: {$in: users},
      },
      update_content
    )
    return {error: null, message: `successfully updated users: ${users}`}
  }

  const update_one_user = async() =>{
    await user_collection.updateOne(
      {
        ...query_condition, 
        _id: user_id,
      },
      update_content
    )

    return {error: null, message: `successfully updated user: ${user_id}`}
  }

  try{
    let response
    if(update_many) response = await update_many_users(update_users)
    else response = await update_one_user()
    //check if error occured
    return response
  }
  catch(e){
    return {error: e, message: "something went wrong. could not update relevant user data"}
  }
};
