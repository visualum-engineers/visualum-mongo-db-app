exports = async function ({
  class_ids = [],
  query_condition = {},
  find_many = false,
}) {
  const class_collection = context.services
    .get("mongodb-atlas")
    .db("Development")
    .collection("classes");

  const find_one_class = async (query_condition, class_ids) => {
    try {
      const query = {
        ...query_condition,
        //validate user_read
        anyOf: [
          { "class_admins.user_id": context.user.id },
          { students: context.user.id },
        ],
      };
      //can query without id, unless provided
      if (class_ids.length > 0) query._id = class_ids[0];
      const result = [await class_collection.findOne(query)];
      return result;
    } catch (e) {
      const errorParms = {
        error_message: `Could not find this single class: ${class_ids[0]}`,
        error_metadata: e,
      };
      throw context.functions.execute("create_async_error", errorParms);
    }
  };
  const find_many_classes = async (query_condition, class_ids) => {
    try {
      const query = {
        ...query_condition,
        //validate user_read
        anyOf: [
          { "class_admins.user_id": context.user.id },
          { students: context.user.id },
        ],
      };
      //can query without id, unless provided
      if (class_ids.length > 0) query._id = { $in: class_ids };

      const result = await class_collection.find(query).limit(1000);
      return result;
    } catch (e) {
      const errorParms = {
        error_message: `Could not find multiple classes: ${class_ids}`,
        error_metadata: e,
      };
      throw context.functions.execute("create_async_error", errorParms);
    }
  };
  try {
    let result;
    if (find_many) result = find_many_classes(query_condition, class_ids);
    else result = find_one_class(query_condition, class_ids);
    return {
      error: null,
      message: `successfully found class/classes`,
      result: result,
    };
  } catch (e) {
    const errorParms = {
      error_message: `Could not find class/classes`,
      error_metadata: e,
    };
    throw context.functions.execute("create_async_error", errorParms);
  }
};
