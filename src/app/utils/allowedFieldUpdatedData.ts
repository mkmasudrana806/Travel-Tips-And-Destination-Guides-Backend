/**
 * -------------------- makeAllowedFieldData ---------------------
 * @param allowedFields array of allowed fields like (keyof TUser)[] = ['email', 'name',..and so on]
 * @param payload payload data to update
 */
const makeAllowedFieldData = <T>(
  allowedFields: (keyof T)[],
  payload: Partial<T>
) => {
  const updatedData: Partial<T> = {};
  allowedFields.forEach((field) => {
    if (payload[field] || payload[field] === "" || payload[field] === false) {
      updatedData[field] = payload[field];
    }
  });

  return updatedData;
};

export default makeAllowedFieldData;
