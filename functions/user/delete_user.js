exports = async function () {
  const user_collection = context.services
    .get("mongodb-atlas")
    .db("Development")
    .collection("users");
  const user_id = context.user.id;

  try {
    const user = await user_collection.findOne({ _id: user_id });
    //find classes. if they're the only teacher in it
    //remove the class and all respective data
    //there should only be one, but to ensure clean up, we loop through
    //if neither exists, we can just delete user document
    if (!user.classes || user.account_type === "student") {
      return await user_collection.deleteOne({ _id: user_id });
    }

    if (user.account_type === "admin") {
      /* 1. check is account is admin
              2. If admin, query organizations part of. If only one, 
              3. Fail query, cannot delete
              4. If n ot only one, update organization admin, and class teacher fields respectively
          */
      const delete_params = {
        delete_query: {
          teachers: [user_id],
        },
        delete_many: true,
      };
      const delete_many = await context.functions.execute(
        "delete_class",
        delete_params
      );
      if (delete_many.error)
        return { error: delete_many, message: "could not delete classes" };
    }

    const update_params = {
      update_query: {
        teachers: {
          $all: [user_id],
        },
        teacher_arr_size: {
          $gt: 1,
        },
      },
      update_many: true,
    };

    const update_many = await context.functions.execute(
      "update_class",
      update_params
    );
    if (update_many.error)
      return { error: update_many, message: "could not update classes" };

    //delete user
    await user_collection.deleteOne({ _id: user_id });
    return {
      error: null,
      message: "user and associated data successfully deleted",
    };
  } catch (e) {
    return { error: e, message: "could not delete user" };
  }
};
