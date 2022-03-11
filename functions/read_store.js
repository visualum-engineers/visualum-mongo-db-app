exports = async function ({
  store_ids = [],
  query_condition,
  read_many = false,
}) {
  //logged in user data
  const collection = context.services
    .get("mongodb-atlas")
    .db("Development")
    .collection("rewardStores");
  const user_data = context.user.custom_data;
  const classes = user_data.classes;
  const organization_id = user_data.organization_id;
  const read_many_stores = async () => {
    //validate user_access
    try {
      //generate access map
      let access_map = { [organization_id]: true };
      for (let i of classes) access_map[i] = true;
      //check if match exists
      let match = store_ids.every((el) => el in access_map);
      if (!match) throw new Error("you do not have access to read this store");
    } catch (e) {
      const error_parms = {
        error_message: "could not validate user access",
        error_metadata: e,
      };
      throw context.functions.execute("create_async_error", error_parms);
    }
    //return all docs
    const result = await collection
      .find({
        ...query_condition,
        _id: { $in: store_ids },
      })
      .limit(1000);
    return result;
  };
  const read_one_store = async () => {
    //validate user_access
    try {
      let class_match = classes.find((el) => store_ids[0] === el);
      let org_match = organization_id === store_ids[0];
      if (!class_match && !org_match)
        throw new Error("you do not have access to read this store");
    } catch (e) {
      const error_parms = {
        error_message: "could not validate user access",
        error_metadata: e,
      };
      throw context.functions.execute("create_async_error", error_parms);
    }
    //return all docs
    const result = await collection.findOne({
      _id: store_ids[0],
    });
    return result;
  };
  //_main_
  try {
    let result;
    if (read_many) result = await read_many_stores();
    else result = await read_one_store();
    return {
      error: null,
      message: `successfully fetched reward store data`,
      result: result,
    };
  } catch (e) {
    const errorParms = {
      error_message:
        "Something went wrong. could not read document from reward store collection",
      error_metadata: e,
    };
    throw context.functions.execute("create_async_error", errorParms);
  }
};
