exports = async function ({
  user_id = "",
  many_user_ids = [],
  query_condition = {},
  read_many = false,
}) {
  const user_collection = context.services
    .get("mongodb-atlas")
    .db("Development")
    .collection("users");
  const read_one_user = async () => {
    try {
      const documents = await user_collection.findOne({
        ...query_condition,
        _id: {
          user_id,
        },
      });
      return {
        error: null,
        message:
          documents.length <= 0
            ? "no documents found"
            : `found ${documents.length} documents`,
        documents: documents
      };
    } catch (e) {
      const errorParms = {
        error_message: `user documents could not be found or accessed: ${many_user_ids}`,
        error_metadata: e,
      };
      throw context.functions.execute("create_async_error", errorParms);
    }
  };

  const read_many_users = async () => {
    try {
      if (many_user_ids.length <= 0) return;
      const documents = await user_collection.find({
        ...query_condition,
        _id: {
          $in: many_user_ids,
        },
      });
      return {
        error: null,
        message:
          documents.length <= 0
            ? "no documents found"
            : `found ${documents.length} documents`,
        documents: documents
      };
    } catch (e) {
      const errorParms = {
        error_message: `user document could not be found or accessed: ${user_id}`,
        error_metadata: e,
      };
      throw context.functions.execute("create_async_error", errorParms);
    }
  };

  //_main_
  try {
    let response;
    if (read_many) response = await read_many_users();
    else response = await read_one_user();
    return response;
  } catch (e) {
    return {
      error: e,
      message: "Something went wrong reading user/users",
    };
  }
};
