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
    query={},
    update_content = {}
  }) => {
    const result = await collection.updateOne(query,
      update_content
    );
    return [result];
  };
  const update_many = async ({
    query={},
    update_content = {}
  }) => {
    //2 queries needed since update many does not have a query limit
    const documents = await collection
      .find(query)
      .limit(1000);
    const doc_ids = documents.forEach((doc) => doc._id);
    const result = await collection.updateMany(
      { _id: { $in: doc_ids } },
      update_content
    );
    return result;
  };
  const create_query = ({
    filter_query={},
    query_condition={},
    ids=[]
  }) =>{
    delete filter_query._id;
    let query = {
      _id:{ $in: ids },
      ...filter_query
    };
    const query_keys = Object.keys(query_condition);
    for(let key of query_keys){
      if(key in query) delete query_condition[key];
    }
    query = {
      ...query,
      ...query_condition
    };
    return query;
  };
  try {
    let result;
    //create_query in proper order
    const query = create_query({
      filter_query: filter_query,
      query_condition: query_condition,
      ids: ids
    });
    
    if (update_multiple_docs)
      result = await update_many({
        query: query,
        update_content: update_content,
      });
    else
      result = await update_one({
        query: query,
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

