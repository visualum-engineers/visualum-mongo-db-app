exports = async function(arg){
  /*
    Accessing application's values:
    var x = context.values.get("value_name");

    Accessing a mongodb service:
    var collection = context.services.get("mongodb-atlas").db("dbname").collection("coll_name");
    collection.findOne({ owner_id: context.user.id }).then((doc) => {
      // do something with doc
    });

    To call other named functions:
    var result = context.functions.execute("function_name", arg1, arg2);

    Try running in the console below.
  */
  //user collection
  const collection = context.services.get("mongodb-atlas").db("Development").collection("users");
  const user_id = context.user.id;
  const name = context.user.data.name;
  const account_type = context.user.custom_data.account_type;
  
  const [first_name, last_name] = name.split(" ");
  
  const provider_type = context.user.identities[0].provider_type;
  
  const newUserDocument = {
    _id: user_id,
    account_type: account_type,
    classes: [],
    email: context.user.custom_data.email,
    email_confirmed: provider_type === "oauth2-google",
    first_name: first_name,
    last_name: last_name,
    user_creation_date: new Date(),
    user_points: [],
    user_settings:{
      
    }
  };
  try{
      await collection.insertOne(newUserDocument);
  } catch(e){
    return {error: e, message: "could not sign up user"};
  }

  return {error: null, message: "user successfully created"};
};