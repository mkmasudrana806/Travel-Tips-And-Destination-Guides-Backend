import z, { string } from "zod";

// create user validations schema
const createUserValidationsSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: "Name is required",
    }),
    email: z
      .string({
        required_error: "Email is required",
      })
      .email("Invalid email address"),
    password: z.string().optional(),
    age: z.number({
      invalid_type_error: "Age should be a number",
      required_error: "Age is required",
    }),
    gender: z.enum(["male", "female", "others"], {
      invalid_type_error: "Gender is invalid",
      required_error: "Gender is required",
    }),
    contact: z.string({
      invalid_type_error: "Contact should be a string",
      required_error: "Contact number is required",
    }),
    address: z.string({
      invalid_type_error: "Address should be a string",
      required_error: "Address is required",
    }),
  }),
});

// update user validations schema
const updateUserValidationsSchema = z.object({
  body: z.object({
    name: z
      .string({
        invalid_type_error: "Name should be a string",
      })
      .optional(),
    age: z
      .number({
        invalid_type_error: "Age should be a number",
      })
      .optional(),
    contact: z
      .string({
        invalid_type_error: "Contact should be a string",
      })
      .optional(),
    address: z
      .string({
        invalid_type_error: "Address should be a string",
      })
      .optional(),
  }),
});

// change user status schema
const changeUserStatusSchema = z.object({
  body: z.object({
    status: z.enum(["active", "blocked"], {
      required_error: "User status is required",
    }),
  }),
});

// change user role schema
const changeUserRoleSchema = z.object({
  body: z.object({
    role: z.enum(["user", "admin"], {
      required_error: "User role is required",
    }),
  }),
});

// make user verified schema
const makeUserVerifiedSchema = z.object({
  body: z.object({
    isVerified: z.boolean({
      required_error: "isVerified is required",
      invalid_type_error: "isVerified value should be boolean",
    }),
  }),
});

// make user premium access schema
const makeUserPremiumAccessSchema = z.object({
  body: z.object({
    premiumAccess: z.boolean({
      required_error: "premiumAccess is required",
      invalid_type_error: "premiumAccess value should be boolean",
    }),
  }),
});

export const UserValidations = {
  createUserValidationsSchema,
  updateUserValidationsSchema,
  changeUserStatusSchema,
  changeUserRoleSchema,
  makeUserVerifiedSchema,
  makeUserPremiumAccessSchema,

};
