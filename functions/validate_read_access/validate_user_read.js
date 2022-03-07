exports = function ({ 
    account_type,
    query_user_ids,
    curr_user_id,
    many_condition
}){
   //determine an added query condition,
  //based off account type, this query
  //will be used for ensuring only documents
  //the user has access to, can be returned
    let custom_query = {};
    //we're dealing with the owner
    if (query_user_ids.length === 1 && curr_user_id === query_user_ids[0])
      return {};
    //we're not dealing with the owner
    switch (account_type) {
      case "student":
        const invalid =
          query_user_ids.length > 1 ||
          query_user_ids[0] !== BSON.ObjectId(context.user.id);
        if (invalid) {
          throw Error(
            "student accounts cannot access other accounts expect their own"
          );
        }
        break;
      case "teacher":
        if (
          many_condition ||
          query_user_ids[0] !== BSON.ObjectId(context.user.id)
        ) {
          custom_query = {
            teachers: { $elemMatch: BSON.ObjectId(context.user.id) },
          };
        }
        break;
      case "admin":
        if (
          many_condition ||
          query_user_ids[0] !== BSON.ObjectId(context.user.id)
        ) {
          custom_query = {
            admins: { $elemMatch: BSON.ObjectId(context.user.id) },
          };
        }
        break;
      default:
        throw new Error(`invalid account type: ${account_type}`);
    }
    return custom_query;
  };
