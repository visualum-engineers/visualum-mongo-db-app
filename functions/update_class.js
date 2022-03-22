exports = async function ({
  update_content = {},
  query_condition = {},
  update_many = false,
  class_ids = [],
}) {
  const user_data = context.user.custom_data;
  const account_type = user_data.account_type;
  const class_collection = context.services
    .get("mongodb-atlas")
    .db("Development")
    .collection("classes");
  if (account_type !== "teacher" && account_type !== "admin")
    throw Error("you cannot edit classes");

  const update_params = {
    collection: class_collection,
    filter_query: { "class_admins.user_id": context.user.id },
    query_condition: query_condition,
    update_content: update_content,
    ids: class_ids,
    update_multiple_docs: update_many,
    error_message: `Something went wrong. could not update classes: ${class_ids}`,
    success_message: `successfully updated class/classes: ${class_ids}`,
  };
  const result = await context.functions.execute("update_func_template", update_params);
  return result
};
