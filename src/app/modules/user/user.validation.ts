import z from "zod";

const userSchema = z.object({
  name: z
    .string({
      required_error: "Name is required",
    })
    .max(100),
  email: z
    .string({
      required_error: "Email is required",
    })
    .email("Invalid email address"),
  password: z.string(),
  age: z
    .number({
      invalid_type_error: "Age should be a number",
      required_error: "Age is required",
    })
    .min(5)
    .max(150),
  gender: z.enum(["male", "female"], {
    invalid_type_error: "Gender is invalid",
    required_error: "Gender is required",
  }),
  address: z
    .string({
      invalid_type_error: "Address should be a string",
      required_error: "Address is required",
    })
    .max(256),
});

// create user validations schema
const createUserValidationsSchema = z.object({
  body: userSchema.strict(),
});

// update user validations schema
const updateUserValidationsSchema = z.object({
  body: userSchema.partial().omit({ password: true, email: true }).strict(),
});

// change user status schema
const changeUserStatusSchema = z.object({
  body: z
    .object({
      status: z.enum(["active", "blocked"], {
        required_error: "User status is required",
      }),
    })
    .strict(),
});

// change user role schema
const changeUserRoleSchema = z.object({
  body: z
    .object({
      role: z.enum(["user", "admin"], {
        required_error: "User role is required",
      }),
    })
    .strict(),
});

// ger verification
const makeUserVerifiedSchema = z.object({
  body: z
    .object({
      isVerified: z.boolean({
        required_error: "isVerified is required",
        invalid_type_error: "isVerified value should be boolean",
      }),
    })
    .strict(),
});

// make user premium access schema
const makeUserPremiumAccessSchema = z.object({
  body: z
    .object({
      premiumAccess: z.boolean({
        required_error: "premiumAccess is required",
        invalid_type_error: "premiumAccess value should be boolean",
      }),
    })
    .strict(),
});

export const UserValidations = {
  createUserValidationsSchema,
  updateUserValidationsSchema,
  changeUserStatusSchema,
  changeUserRoleSchema,
  makeUserVerifiedSchema,
  makeUserPremiumAccessSchema,
};
