exports = async function(arg){
  const jwt = require('jsonwebtoken');
  //decrypt token
  try{
    //if empty, we're dealing with a 
    //new user since we dont
    //have a schema for them
    const user_data = context.user.custom_data.email;
    
    //create a user schema document since it does not exist
    if(!user_data) {
      const token = arg;
      const account_type = arg.account_type;
      const decoded_token = jwt.decode(token);
      const sign_up_info = {
        account_type: account_type,
        email: decoded_token.email,
        email_verified: decoded_token.email_verified
      };
      return await context.functions.execute("user/create_user", sign_up_info);
    }
    return {error: null};
  } catch(e){
      return {error: e};
  }
};
