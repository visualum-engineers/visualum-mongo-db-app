exports = async function ({
  query_condition = {},
  user_id = BSON.ObjectId(),
  many_user_ids = [],
  update_content = {},
  update_many = false,
}) {
  //setup
  const user_collection = context.services
    .get("mongodb-atlas")
    .db("Development")
    .collection("users");

  //update functions
  const update_many_users = async ({
    users,
    query_condition,
    update_content,
  }) => {
    //protect against updating entire collection
    if (Object.keys(query_condition).length <= 0) {
      const access_error = {
        error: true,
        message: "you do not have access to update these users",
      };
      throw context.functions.execute("create_async_error", access_error);
    }

    try {
      //2 queries needed since update many does not have a query limit
      const user_documents = await user_collection
        .find({
          ...query_condition,
          _id: { $in: users },
        })
        .limit(1000);
      const ids = user_documents.forEach((doc) => doc["_ids"]);
      const result = user_collection.update_many(
        { _id: { $in: ids } },
        update_content
      );
      return {
        error: null,
        message: `successfully updated ${result.length} users: ${users}`,
        result: result,
      };
    } catch (e) {
      const errorParms = {
        error_message: `could not update users: ${users}`,
        error_metadata: e,
      };
      throw context.functions.execute("create_async_error", errorParms);
    }
  };

  const update_one_user = async ({
    user_id,
    update_content,
    query_condition,
  }) => {
    try {
      const result = await user_collection.updateOne(
        {
          ...query_condition,
          _id: object_id_user,
        },
        update_content
      );
      return {
        error: null,
        message: `successfully updated user: ${user_id}`,
        result: result,
      };
    } catch (e) {
      const errorParms = {
        error_message: `could not update user information for user: ${user_id}`,
        error_metadata: e,
      };
      throw context.functions.execute("create_async_error", errorParms);
    }
  };

  //_main_
  try {
    let user_document = context.user.custom_data;
    //if this is the case, the account is recently created
    //so we must fetch the info ourselves
    if (!user_document) {
      const read_user_params = {
        user_id: BSON.ObjectId(context.user.id),
      };
      user_document = await context.function.execute(
        "read_user",
        read_user_params
      );
    }

    //convert provided user id to object id
    let object_id_user;
    try {
      object_id_user = BSON.ObjectId(user_id);
    } catch (e) {
      object_id_user = user_id;
    }
    //explicit validation functions
    const validate_fields_params = {
      update_content: update_content,
      users_ids: many_user_ids.length > 0 ? many_user_ids : [object_id_user],
      user_document: user_document,
    };
    const validate_fields = context.functions.execute(
      "validate_user_write",
      validate_fields_params
    );

    if (validate_fields) {
      const custom_query = {
        ...query_condition,
        ...context.function.execute("validate_user_read", {
          account_type: user_document.account_type,
          query_user_ids: many_user_ids,
          curr_user_id: BSON.ObjectId(context.user.id),
          many_condition: update_many,
        }),
      };
      let response;
      if (update_many)
        response = await update_many_users({
          users: many_user_ids,
          query_condition: custom_query,
          update_content: user_content,
        });
      else
        response = await update_one_user({
          user_id: object_id_user,
          query_condition: custom_query,
          update_content: update_content,
        });
      return response;
    }
  } catch (e) {
    return {
      error: e,
      message: "something went wrong. could not update relevant user data",
    };
  }
};
