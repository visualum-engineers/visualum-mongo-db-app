exports = async function(arg){
  //user collection
  const collection = context.services.get("mongodb-atlas").db("Development").collection("users");
  const user_id = context.user.id;
  const name = context.user.name;

  try{
      const [first_name, last_name] = name.split(" ");

      const newUserDocument = {
        _id: user_id,
        account_type: arg.account_type,
        classes: [],
        email: arg.email,
        email_confirmed: arg.email_confirmed,
        first_name: first_name,
        last_name: last_name,
        user_creation_date: new Date(),
        user_points: [],
        user_settings:{
        }
      };
      await collection.insertOne(newUserDocument);
  } catch(e){
    return {error: e, message: "could not sign up user"};
  }

  return {error: null, message: "user successfully created"};
};