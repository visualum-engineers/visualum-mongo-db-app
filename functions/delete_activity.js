exports = function ({ query_condtion = {}, delete_many = false }) {
  //logged in user_data
  const user_id = context.user.id;
  const user_data = context.user.custom_data;
  const collection = context.services
    .get("mongodb-atlas")
    .db("Development")
    .collection("activities");
  const delete_many_activities = async (query) => {
    const found_activities = await collection.find(query).limit(1000);
    const activity_ids = found_activities.forEach((doc) => doc["_id"]);
    const result = await collection.deleteMany(
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
    throw new Error("you do not have access to do this");
  try {
    const query = {
      ...query_condtion,
      owner_ids: user_id,
    };
    let result;
    if (delete_many) result = await delete_many_activities(query);
    else result = await collection.deleteOne(query);
    return result;
  } catch (e) {
    const error_parms = {
      error_message: "could not delete documents",
      error_metadata: e,
    };
    throw context.functions.execute("create_async_error", error_parms);
  }
};
