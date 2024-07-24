type NonNullableObject<Type> = {
  [Key in keyof Type]: NonNullable<Type[Key]>;
};

export function pickDefinedProperties<Type extends Record<string, unknown>>(object: Type): NonNullableObject<Type> {
  const result = {} as NonNullableObject<Type>;

  for (const [key, value] of Object.entries(object)) {
    if (value !== null && value !== undefined) {
      result[key] = value;
    }
  }

  return result;
}
