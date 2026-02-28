import z from "zod";

// login user schema
const loginUserSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: "Email is required",
      })
      .email("Invalid email address"),
    password: z
      .string({
        required_error: "Password is required",
      })
      .min(4)
      .max(100),
  }),
});

// change user password schema
const changeUserPasswordSchema = z.object({
  body: z.object({
    oldPassword: z
      .string({
        required_error: "Old password is required",
      })
      .min(4)
      .max(100),
    newPassword: z
      .string({
        required_error: "New password is required",
      })
      .min(4)
      .max(100),
  }),
});

// forgot password schema
const forgotPasswordSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: "Email is required",
      })
      .email("Invalid email address"),
  }),
});

// reset password schema
const resetPasswordSchema = z.object({
  body: z.object({
    token: z
      .string({
        required_error: "Token is required",
      })
      .max(512),
    email: z
      .string({
        required_error: "Email is required",
      })
      .email("Invalid email address"),
    newPassword: z
      .string({
        required_error: "New password is required",
      })
      .min(4)
      .max(100),
  }),
});

// refresh token schema
const refreshTokenSchema = z.object({
  cookies: z.object({
    refreshToken: z
      .string({
        required_error: "Refresh token is required",
        invalid_type_error: "Refresh token must be string",
      })
      .max(512),
  }),
});

export const AuthValidations = {
  loginUserSchema,
  changeUserPasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshTokenSchema,
};
