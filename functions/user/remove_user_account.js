exports = function () {
  const user_id = context.user.id;
  const user_doc_result = await context.functions.execute("read_user", {
    user_id: user_id,
  });
  //grab user doc
  const user_doc = user_doc_result.result;
  if (!user_doc) return user_doc_result;

  //if they're a student we can delete the account
  if (user_doc.account_type === "student") {
    return context.functions.execute("delete_user");
  }
  /*   1. check is account is admin
   *   2. If admin, query organization. If only one admin,
   *   3. Fail query, cannot delete
   *   4. If not only one, update organization admin, and class teacher fields respectively
   */

  if (user_doc.account_type === "admin") {
    //find org doc and delete if only 1 admin
    const read_params = { organization_id: user_doc.organization_id };
    const org_doc_result = await context.functions.execute(
      "read_organization",
      read_params
    );
    const org_doc = org_doc_result.result;
    if (org_doc.admins.length < 1) {
      const error = new Error(
        `Before deleting your account, you must remove the organization: ${organization_name}.`
      );
      error.organization_id = read_params.organization_id;
      return error;
    }
  }
  //means we're dealing with an admin or teacher account
  const delete_assignments_params = {
    query_condition: { activity_creator: user_id },
    delete_many: true,
  };
  const delete_class_params = {
    query_condition: {
      teachers: user_doc._id,
      teachers_length: { $lte: 1 },
    },
    delete_many: true,
  };
  const update_class_params = {
    query_condition: {
      teachers: user_doc._id,
      teachers_length: { $gt: 1 },
    },
    no_limit: true,
    update_content: {
      $pull: user_doc._id,
    },
    };
    const delete_user_params = {

    }
  const update_class = context.functions.execute(
    "update_class",
    update_class_params
  );
  const delete_class = context.functions.execute(
    "delete_class",
    delete_class_params
  );
  const delete_assignments = context.functions.execute(
    "delete_assignments",
    delete_assignments_params
  );
  const delete_user = context.functions.execute("delete_user")
  const result = await Promise.all([
    delete_assignments,
    delete_class,
      update_class,
    delete_user
  ]);
  return {
    delete_assignments: result[0],
    delete_class: result[1],
      update_class: result[2],
    delete_user: result[3]
  };
};
