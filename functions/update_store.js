exports = function ({
  query_condition = {},
  store_ids = [],
  update_content = {},
  update_many = false,
}) {
  //user info
  const user_data = context.user.custom_data;
  const account_type = user_data.account_type;
  const classes = user_data.classes;
  const organization_id = user_data.organization_id;
  const store_collection = context.services
    .get("mongodb-atlas")
    .db("Development")
    .collection("rewardStores");
  const update_many_stores = async ({
    store_ids = [],
    query_condition = {},
    update_content = {},
  }) => {
    try {
      //2 queries needed since update many does not have a query limit
      const store_documents = await store_collection
        .find({
          ...query_condition,
          _id: { $in: store_ids },
        })
        .limit(1000);
      const ids = store_documents.forEach((doc) => doc["_ids"]);
      const result = store_collection.update_many(
        { _id: { $in: ids } },
        update_content
      );
      return result;
    } catch (e) {
      const errorParms = {
        error_message: `could not update stores: ${store_ids}`,
        error_metadata: e,
      };
      throw context.functions.execute("create_async_error", errorParms);
    }
  };
  const update_one_store = async ({
    store_ids = [],
    query_condition = {},
    update_content = {},
  }) => {
    try {
      const result = await store_collection.updateOne(
        {
          ...query_condition,
          _id: store_ids[0],
        },
        update_content
      );
      return result;
    } catch (e) {
      const errorParms = {
        error_message: `could not update store info: ${store_ids[0]}`,
        error_metadata: e,
      };
      throw context.functions.execute("create_async_error", errorParms);
    }
  };
  //validate user access
  const validate_user_access = ({
    classes,
    organization_id,
    store_ids,
    account_type,
  }) => {
    //generate access map
    let access_map = { [organization_id]: { admin: true } };
    for (let i of classes) access_map[i] = { teacher: true, admin: true };
    //check if match exists for id, and whether account type has access
    const match = store_ids.every(
      (el) => el in access_map && account_type in access_map[el]
    );
    //check update content will write
    // to any no write fields
    const no_write_fields = {
      _id: true,
      creation_date: true,
    };
    if (account_type === "teacher") no_write_fields.organization_id = true;
    const fields_change = Object.keys(update_content);
    const write_granted = fields_change.every((el) => !(el in no_write_fields));

    return match && write_granted;
  };

  const access_granted = validate_user_access({
    classes: classes,
    organization_id: organization_id,
    store_ids: store_ids,
    account_type: account_type,
  });
  if (!access_granted) {
    const error_parms = {
      error_message: "could not validate user access",
      error_metadata: e,
    };
    throw context.functions.execute("create_async_error", error_parms);
  }

  try {
    let result;
    if (update_many)
      result = await update_many_stores({
        store_ids: store_ids,
        query_condition: query_condition,
        update_content: update_content,
      });
    else
      result = await update_one_store({
        store_ids: store_ids,
        query_condition: query_condition,
        update_content: update_content,
      });
    return {
      error: null,
      message: `successfully updated user stores: ${store_ids}`,
      result: result,
    };
  } catch (e) {
    const errorParms = {
      error_message: `Something went wrong. could not update reward stores: ${store_ids}`,
      error_metadata: e,
    };
    throw context.functions.execute("create_async_error", errorParms);
  }
};
