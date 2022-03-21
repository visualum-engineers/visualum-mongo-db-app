exports = async function ({
  class_ids = [],
  query_condition = {},
  delete_many = false,
}) {
  const user_data = context.user.custom_data;
  const account_type = user_data.account_type;
  const class_collection = context.services
    .get("mongodb-atlas")
    .db("Development")
    .collection("classes");
  if (account_type === "student")
    throw Error("you do not have access to delete class");  
  const delete_one_class = async (query_condition, class_ids) => {
    try {
      const query = {
        ...query_condition,
        'class_admins.user_id': context.user.id,
        _id: class_ids[0]
      };
      const result = [await class_collection.deleteOne(query)]
      return result
    } catch (e) {
      const errorParms = {
        error_message: `Could not delete this single class: ${class_ids[0]}`,
        error_metadata: e,
      };
      throw context.functions.execute("create_async_error", errorParms);
    }
  }
  const delete_many_classes = async(query_condition, class_ids) => {
    try {
      const query = {
        ...query_condition,
        "class_admins.user_id": context.user.id,
        _id: { $in: class_ids },
      };
      const find_docs = await class_collection.find(query).limit(1000);
      const class_found_ids = find_docs.forEach((doc) => doc["_id"]);
      const result = await class_collection.deleteMany({
        _id: { $in: class_found_ids }
      })  
      return result
    } catch (e) {
      const errorParms = {
        error_message: `Could not delete multiple classes: ${class_ids}`,
        error_metadata: e,
      };
      throw context.functions.execute("create_async_error", errorParms);
    }
  }
  try {
    let result
    if(delete_many) result = delete_many_classes(query_condition, class_ids)
    else result = delete_one_class(query_condition, class_ids)
    return {
      error: null, 
      message: `successfully deleted class/classes`,
      result: result
    }
  }
  catch (e) {
    const errorParms = {
      error_message: `Could not delete class/classes`,
      error_metadata: e,
    };
    throw context.functions.execute("create_async_error", errorParms);
  }
};
