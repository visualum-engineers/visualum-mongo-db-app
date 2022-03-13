exports = async function () {
  const user_collection = context.services
    .get("mongodb-atlas")
    .db("Development")
    .collection("users");
  const user_id = context.user.id;

  try {
    //delete user
    const result = await user_collection.deleteOne({ _id: user_id });
    return {
      error: null,
      message: "user and associated data successfully deleted",
      result: result
    };
  } catch (e) {
    return { error: e, message: "could not delete user" };
  }
};