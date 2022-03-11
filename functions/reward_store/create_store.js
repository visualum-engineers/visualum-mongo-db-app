exports = async function ({ class_id, organization_id, store_name }) {
  if (class_id && organization_id)
    throw new Error(
      "You cannot have a class_id and a organization_id. You can only create one at a time"
    );
  //logged in user data
  const user_data = context.user.custom_data;
  const account_type = user_data.account_type;
  const classes = user_data.classes;
  const organization_id = user_data.organization_id;
  let new_store_document;
  //create document template
  try {
    new_store_document = {
      _id: new BSON.ObjectId(),
      creation_date: new Date(),
      reward_items: [],
      store_name: store_name,
    };
  } catch (e) {
    const error_parms = {
      error_message: "could not create template for store",
      error_metadata: e,
    };
    throw context.functions.execute("create_async_error", error_parms);
  }
  //validate user access
  try {
    if (account_type !== "teacher" || account_type !== "admin")
      throw new Error("you do not access to create stores");
    if (class_id) {
      let match = classes.find((el) => class_id === el);
      if (!match)
        throw new Error(
          "you do not have access to create a store for this class"
        );
      else new_document.class_id = class_id;
    }
    if (organization_id) {
      if (account_type === "teacher")
        throw new Error("you do not have access to create organization");
      else new_document.organization_id = organization_id;
    }
  } catch (e) {
    const error_parms = {
      error_message: "could not validate user access",
      error_metadata: e,
    };
    throw context.functions.execute("create_async_error", error_parms);
  }
  //insert document
  try {
    const collection = context.services
      .get("mongodb-atlas")
      .db("Development")
      .collection("rewardStores");
    const new_store_id = await collection.insertOne(new_store_document);
    return {
      error: null,
      message: "successfully created store",
      result: new_store_id,
    };
  } catch (e) {
    const error_parms = {
      error_message: "could not insert document into reward stores collection",
      error_metadata: e,
    };
    throw context.functions.execute("create_async_error", error_parms);
  }
};
