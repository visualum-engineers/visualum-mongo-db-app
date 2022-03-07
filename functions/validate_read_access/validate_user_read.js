// exports = function ({
//   custom_condition = true,
//   curr_user_id = BSON.ObjectId(),
//   read_many = false,
//   user_documents = [],
// }) {
//   if (!custom_condition)
//     throw new Error("custom condition has prevented access");
//   if (user_documents.length <= 0)
//     throw new Error("users array cannot be empty. Pass in a user id");
//   if (users.length === 1 && curr_user_id === users[0]["_id"]) return true;
//   //when user logged in doesnt match, check if user has read access
//   //generate map
//     const user_access_map = {};
//   for (let user of user_documents[0])
//     user_access_map[user] = true;
//   for (let user of users) {
//     if (!(user in user_access_map))
//       throw new Error(`you do not have access to user: ${user}`);
//   }
//   return true;
// };
