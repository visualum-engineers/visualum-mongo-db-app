exports = async function({
  email = "",
  email_verified = false,
  account_type= ""
}){
  //user collection
  const collection = context.services.get("mongodb-atlas").db("Development").collection("users");
  const user_id = context.user.id;
  const name = context.user.data.name;
  let newUserDocument
  try{
      const [first_name, last_name] = name.split(" ");
      newUserDocument = {
          _id: new BSON.ObjectId(user_id),
          user_id: user_id, 
          account_type: account_type,
          classes: [],
          email: email,
          email_confirmed: email_verified,
          first_name: first_name,
          last_name: last_name,
          user_creation_date: new Date(),
          user_points: [],
          user_settings:{
            
          }
      };
  } catch(e){
      const error = new Error("invalid new user document")
      error.metadata = e
      throw error
  }
  
  try{
      await collection.insertOne(newUserDocument);
      
      return {error: null, message: "user successfully created"};
  } 
  catch(e){
      const error = new Error("could not create a new user")
      error.metadata = e
      throw error
  }
};

