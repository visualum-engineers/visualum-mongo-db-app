exports = async function ({ class_name, img_url, additional_fields = {} }) {
  //will generate random alphanumeric strings
  const randomize = require("randomatic");
  const user_data = context.user.custom_data;
  const account_type = user_data.account_type;
  if (account_type === "student") throw new Error("you cannot create a class");
  const collection = context.services
    .get("mongodb-atlas")
    .db("Development")
    .collection("classes");

  //generates a string 6-8 characters long
  const generate_class_code = async () => {
    let count = 0;
    let exists = true;
    let class_code = "";
    //keep generating a unique 6-9 char code
    //until a match does not exist
    while (count <= 700 && exists) {
      const class_code_add = Math.floor(3 * Math.random());
      const class_code_length = class_code_add + 6;
      class_code = randomize("Aa0", class_code_length);
      //will be undefined if no match is found
      exists = await collection.findOne({
        class_code: {
          code: class_code,
          active: true,
        },
      });
      count++;
    }
    if (exists) throw Error("error generating class code. too many collisions");
    return class_code;
  };
  let new_document ={}
  try {
    new_document = {
      ...additional_fields,
      _id: new BSON.ObjectId(),
      class_admins: [user_data.user_profile],
      class_code: {
        code: await generate_class_code(),
        creation_date: new Date(),
        active: true,
      },
      class_name: class_name,
      creation_date: new Date(),
      img_url: img_url,
    };
  } catch (e) {
    const error_parms = {
      error_message: "could new create new class document template",
      error_metadata: e,
    };
    throw context.functions.execute("create_async_error", error_parms);
  }
  
  if (user_data.organization_id)
    new_document.organization_id = user_data.organization_id;
  try {
    const new_class_id = await collection.insertOne(new_document);
    return {
      error: null,
      message: "successfully created class",
      result: new_class_id,
    };
  } catch (e) {
    const error_parms = {
      error_message: "could not insert document into classes collection",
      error_metadata: e,
    };
    throw context.functions.execute("create_async_error", error_parms);
  }
};
