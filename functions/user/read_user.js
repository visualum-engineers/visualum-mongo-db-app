exports = async function({
    user_id,
    readMany = false
  }){
    const user_collection = context.services.get("mongodb-atlas").db("Development").collection("users");

    //decrypt token
    try{
      //if empty, we're dealing with a 
      //new user since we dont
      //have a schema for them
      const user_data = context.user.custom_data.email;
      
      //create a user schema document since it does not exist
      if(!user_data) {
        const decoded_token = jwt.decode(token);
        const sign_up_info = {
          account_type: account_type,
          email: decoded_token.email,
          email_verified: decoded_token.email_verified
        };
        return await context.functions.execute("create_user", sign_up_info);
      }
      return {error: null, message: "user successfully logged in"};
    } catch(e){
        const error = new Error("could not sign user in")
        error.metadata = e
        throw error
    }
  };
  