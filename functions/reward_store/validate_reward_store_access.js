exports = function ({
    organization_id= "",
    classes = [],
    store_ids = [],
    prohibt_org_store = false
}) {
  //validate user_access
    //generate access map
    let access_map = { [organization_id]: "is_org_store" };
    for (let i of classes) access_map[i] = true ;
    //check if match exists
    const all_conditions = (el) => {
      const in_map = el in access_map  
      const is_org_store = access_map[el] === "is_org_store"
      const not_teacher_and_org = !prohibt_org_store ? true : !is_org_store
      return in_map && is_org_store && not_teacher_and_org
    }
    let match = store_ids.every((el) => all_conditions(el));
    return match
  
};
