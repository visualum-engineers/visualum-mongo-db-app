exports = function ({
  custom_condition = true,
  users_ids = [],
  user_document = {},
  update_content = {},
}) {
  if (!custom_condition)
    throw new Error("custom condition has prevented access");
  //validate if user writing to doc is user logged in
  //fields the user cannot access/write to
  let invalid_write_fields = {
    _id: true,
    account_type: true,
    email_confirmed: true,
    payment_confirmed: true,
    user_creation_date: true,
    user_id: true,
  };
  let new_invalid_fields = {};
  const user_id = BSON.ObjectId(context.user.id);
  const user_custom_data = user_document;
  const user_owner = users_ids.length === 1 && users_ids[0] === user_id;
  if (user_owner) invalid_write_fields.user_points = true;
  switch (user_custom_data.account_type) {
    case "student":
      invalid_write_fields = {
        new_invalid_fields,
        ...invalid_write_fields,
      };
      break;
    case "teacher":
      if (!user_owner) {
        new_invalid_fields = {
          email: true,
          first_name: true,
          last_name: true,
          payment_info: true,
          user_avatar: true,
          user_settings: true,
        };
      }

      invalid_write_fields = {
        new_invalid_fields,
        ...invalid_write_fields,
      };
      break;
    case "admin":
      if (!user_owner) {
        new_invalid_fields = {
          classes: true,
          payment_info: true,
          user_avatar: true,
          user_settings: true,
        };
      }
      invalid_write_fields = {
        new_invalid_fields,
        ...invalid_write_fields,
      };
      break;
    default:
      throw new Error("invalid account type");
  }
  const update_content_fields = Object.keys(update_content);
  for (let field of update_content_fields) {
    if (field in invalid_write_fields)
      throw new Error(`user cannot write to this field: ${field}`);
  }

    
  return true;
};
