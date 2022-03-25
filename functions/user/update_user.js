exports = async function ({
  query_condition = {},
  user_ids = [],
  update_content = {},
  update_many = false,
}) {
  //setup
  const user_collection = context.services
    .get("mongodb-atlas")
    .db("Development")
    .collection("users");
  
  //_main_
  try {
    const user_data = context.user.custom_data;
    //explicit validation functions
    const validate_write_params = {
      update_content: update_content,
      users_ids: user_ids.length > 0 ? user_ids : user_ids[0],
      user_document: user_data,
    };
    const validate_write = context.functions.execute(
      "validate_user_write",
      validate_write_params
    );
    const read_access_query = context.function.execute("validate_user_read", {
          account_type: user_data.account_type,
          query_user_ids: user_ids,
          curr_user_id: context.user.id,
          many_condition: update_many,
        })
    if (validate_write) {
      const update_params = {
        collection: user_collection,
        filter_query: read_access_query,
        query_condition: query_condition,
        update_content: update_content,
        ids: user_ids,
        update_multiple_docs: update_many,
        error_message: `Something went wrong. could not update users: ${user_ids}`,
        success_message: `successfully updated user/users: ${user_ids}`,
      };
      const result = await context.functions.execute(
        "update_func_template",
        update_params
      );
      return result;
    }
  } catch (e) {
    return {
      error: e,
      message: "something went wrong. could not update relevant user data",
    };
  }
};
