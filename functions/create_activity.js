exports = async function (assignment_doc = {}){
  //logged in user_data
  const user_id = context.user.id
  const user_data = context.user.custom_data
  const collection = context.services
    .get("mongodb-atlas")
    .db("Development")
    .collection("activities");
  //only restriction
  if (user_data.account_type === "student") {
    throw new Error("you do not have the ability to create assignments")
  }
  const new_document = {
    ...assignment_doc,
    creation_date: new Date(),
    owner_names: [`${user_data.first_name} ${user_data.last_name}`],
    owner_ids: [user_id],
    _id: new BSON.ObjectId()
  }
  try {
    const result = await collection.insertOne(new_document)
    return result
  } catch (e) {
    const error_parms = {
      error_message: "could not insert document",
      error_metadata: e,
    };
    throw context.functions.execute("create_async_error", error_parms);
  }
};