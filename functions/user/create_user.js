exports = async function ({
  email = "",
  email_verified = false,
  account_type = "",
  additional_data = {}
}) {
  //user collection
  const collection = context.services
    .get("mongodb-atlas")
    .db("Development")
    .collection("users");
  const user_id = context.user.id;
  const name = context.user.data.name;
  let newUserDocument;
  try {
    const [first_name, last_name] = name.split(" ");
    newUserDocument = {
      ...additional_data,
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
      user_settings: {},
    };
    //we must create an organization document
    if (account_type === "admin") {

    }
  } catch (e) {
    const errorParms = {
      error_message: "invalid new user document",
      error_metadata: e,
    };
    throw context.functions.execute("create_async_error", errorParms);
  }

  try {
    const result = await collection.insertOne(newUserDocument);
    return {
      error: null,
      message: `successfully created user`,
      result: result,
    };
  } catch (e) {
    const errorParms = {
      error_message: "could not create a new user. Invalid information, or user already exists",
      error_metadata: e,
    };
    throw context.functions.execute("create_async_error", errorParms);
  }
};
