exports = async function ({
  store_ids = [],
  query_condition={},
  delete_many = false
}) {
  const collection = context.services
    .get("mongodb-atlas")
    .db("Development")
    .collection("rewardStores");
  const user_data = context.user.custom_data;
  const classes = user_data.classes;
  const organization_id = user_data.organization_id;

  const delete_one_store = async ({
    store_ids = [],
    query_condition = {}
  }) => {
    const result = await collection.deleteOne({
      ...query_condition,
      _id: store_ids[0],
    });
    return result;
  };
  const delete_many_stores = async ({ 
    query_condition={},
    store_ids=[]
  }) => { 
    const result = await collection.deleteMany({
      ...query_condition,
      _id: {$in: store_ids}
    })
    return result
  };
  
  //validate user access
  if (user_data.account_type === "student") 
    throw new Error("you do not have access to delete stores")

  const access_granted = context.functions.execute(
    "validate_reward_store_access",
    {
      organization_id: organization_id,
      classes: classes,
      store_ids: store_ids,
      prohibt_org_store: user_data.account_type === "teacher"
    }
  );
  if (!access_granted) {
    const error_parms = {
      error_message: "could not validate user access",
      error_metadata: e,
    };
    throw context.functions.execute("create_async_error", error_parms);
  }
  //_main
  try {
    let result;
    if (delete_many) result = await delete_many_stores({
      store_ids: store_ids,
      query_condition: query_condition
    });
    else result = await delete_one_store({
      store_ids: store_ids,
      query_condition: query_condition
    });
    return {
      error: null,
      message: `successfully fetched reward store data`,
      result: result,
    };
  } catch (e) {
    const errorParms = {
      error_message: `Something went wrong. could not delete stores: ${store_ids}`,
      error_metadata: e,
    };
    throw context.functions.execute("create_async_error", errorParms);
  }
};