exports = async function ({
  query_condition = {},
  update_many = false,
  update_content = {},
}) {
  const user_id = context.user.id;
  const user_data = context.user.custom_data;
  const collection = context.services
    .get("mongodb-atlas")
    .db("Development")
    .collection("activities");
  const update_many_activities = async ({ query, update_content }) => {
    const found_activities = await collection.find(query).limit(1000);
    const activity_ids = found_activities.forEach((doc) => doc["_id"]);
    const result = await collection.updateMany(
      {
        _id: { $in: activity_ids },
      },
      update_content
    );
    return result;
  };
  //validate access
  if (
    user_data.account_type !== "teacher" &&
    user_data.account_type !== "admin"
  )
    throw new Error("you do not have access to this activity");

  try {
    const query = {
      ...query_condition,
      owner_ids: user_id,
    };
    let result;
    if (update_many)
      result = await update_many_activities({
        query: query,
        update_content: update_content,
      });
    else result = await collection.updateOne(query, update_content);
    return result;
  } catch (e) {
    const error_parms = {
      error_message: "could not update documents",
      error_metadata: e,
    };
    throw context.functions.execute("create_async_error", error_parms);
  }
};
