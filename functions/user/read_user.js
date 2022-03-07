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

  const read_one_user = async ({
    user_id,
    query_condition = {}
  }) => {
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
        documents: documents,
      };
    } catch (e) {
      const errorParms = {
        error_message: `user documents could not be found or accessed: ${many_user_ids}`,
        error_metadata: e,
      };
      throw context.functions.execute("create_async_error", errorParms);
    }
  };

  const read_many_users = async ({
    many_user_ids,
    query_condition = {}
  }) => {
    try {
      if (many_user_ids.length <= 0) return;
      const documents = await user_collection
        .find({
          ...query_condition,
          _id: {
            $in: many_user_ids,
          },
        })
        .limit(1000);
      return {
        error: null,
        message:
          documents.length <= 0
            ? "no documents found"
            : `found ${documents.length} documents`,
        documents: documents,
      };
    } catch (e) {
      const error_parms = {
        error_message: `user document could not be found or accessed: ${user_id}`,
        error_metadata: e,
      };
      throw context.functions.execute("create_async_error", error_parms);
    }
  };

  //_main_
  try {
    //convert provided user id to object id
    let object_id_user;
    try {
      object_id_user = BSON.ObjectId(user_id);
    } catch (e) {
      object_id_user = user_id;
    }
    //grab curr_user_docs
    let user_document = context.user.custom_data;
    //if this is the case, the account is recently created
    //so we must fetch the info ourselves
    if (!user_document) {
      const read_user_params = {
        user_id: BSON.ObjectId(context.user.id),
      };
      user_document = await read_one_user(read_user_params);
    }
    //handle grabbing the right document
    let response;
    const custom_query = {
      ...query_condition,
      ...context.function.execute("validate_user_read", {
        account_type: user_document.account_type,
        query_user_ids: many_user_ids,
        curr_user_id: BSON.ObjectId(context.user.id),
        many_condition: read_many,
      }),
    };
    if (read_many)
      response = await read_many_users({
        many_user_ids: many_user_ids,
        query_condition: custom_query,
      });
    else
      response = await read_one_user({
        user_id: object_id_user,
        query_condition: custom_query,
      });

    return response;
  } catch (e) {
    return {
      error: e,
      message: "Something went wrong reading user/users",
    };
  }
};
