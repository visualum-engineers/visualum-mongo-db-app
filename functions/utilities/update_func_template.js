exports = async function ({
  collection,
  filter_query = {},
  query_condition = {},
  update_content = {},
  ids = [],
  error_message = "",
  success_message = "",
  update_multiple_docs = false,
}) {
  const update_one = async ({
    ids = [],
    query_condition = {},
    update_content = {},
    filter_query = {},
  }) => {
    const result = await collection.updateOne(
      {
        ...query_condition,
        ...filter_query,
        _id: ids[0],
      },
      update_content
    );
    return [result];
  };
  const update_many = async ({
    ids = [],
    query_condition = {},
    update_content = {},
    filter_query = {},
  }) => {
    //2 queries needed since update many does not have a query limit
    const documents = await collection
      .find({
        ...query_condition,
        ...filter_query,
        _id: { $in: ids },
      })
      .limit(1000);
    const doc_ids = documents.forEach((doc) => doc["_id"]);
    const result = await collection.updateMany(
      { _id: { $in: doc_ids } },
      update_content
    );
    return result;
  };
  try {
    let result;
    if (update_multiple_docs)
      result = await update_many({
        filter_query: filter_query,
        ids: ids,
        query_condition: query_condition,
        update_content: update_content,
      });
    else
      result = await update_one({
        filter_query: filter_query,
        ids: ids,
        query_condition: query_condition,
        update_content: update_content,
      });
    return {
      error: null,
      message: success_message,
      result: result,
    };
  } catch (e) {
    const errorParms = {
      error_message: error_message,
      error_metadata: e,
    };
    throw context.functions.execute("create_async_error", errorParms);
  }
};
