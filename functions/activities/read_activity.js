exports = async function ({ query_condition = {}, read_many = false }) {
  //logged in user_data
  const user_id = context.user.id;
  const collection = context.services
    .get("mongodb-atlas")
    .db("Development")
    .collection("activities");

  try {
    let result;
    //filters out private assignments,
    // unless user owns them
    const query = {
      $or: [
        {
          ...query_condition,
          private: false,
        },
        {
          $and: [
            {
              owner_ids: user_id,
              private: true,
            },
            query_condition,
          ],
        },
      ],
    };
    if (read_many) result = await collection.find(query).limit(1000);
    else result = await collection.findOne(query);
    return result;
  } catch (e) {
    const error_parms = {
      error_message: `could not search or access documents`,
      error_metadata: e,
    };
    throw context.functions.execute("create_async_error", error_parms);
  }
};
