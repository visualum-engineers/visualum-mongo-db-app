exports = async function({
  email = "",
  email_confirmed = false,
  account_type= ""
}){
  //user collection
  const collection = context.services.get("mongodb-atlas").db("Development").collection("users");
  const user_id = context.user.id;
  const name = context.user.data.name;

  try{
      const [first_name, last_name] = name.split(" ");

      const newUserDocument = {
        _id: user_id,
        account_type: account_type,
        classes: [],
        email: email,
        email_confirmed: email_confirmed,
        first_name: first_name,
        last_name: last_name,
        user_creation_date: new Date(),
        user_points: [],
        user_settings:{
        }
      };
      await collection.insertOne(newUserDocument);
  } catch(e){
      const error = new Error("could not create a new user")
      error.metadata = e
      throw error
  }

  return {error: null, message: "user successfully created"};
};

