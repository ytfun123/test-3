import { z } from "zod";

export const signupSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must be 20 characters or less")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores"
      ),
    displayName: z
      .string()
      .max(40, "Display name too long")
      .optional()
      .or(z.literal("")),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password too long"),
    confirmPassword: z.string(),
    recoveryType: z.enum(["email", "phone"]).optional(),
email: z.string().email("Invalid email address").optional().or(z.literal("")),
phone: z
  .string()
  .regex(/^\+?[1-9]\d{6,14}$/, "Invalid phone number")
  .optional()
  .or(z.literal("")),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      if (data.recoveryType === "email") return !!data.email;
      if (data.recoveryType === "phone") return !!data.phone;
      return true;
    },
    {
      message: "Recovery contact is required",
      path: ["email"],
    }
  );

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const messageSchema = z.object({
  content: z.string().min(1).max(2000),
  conversationId: z.string().cuid(),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
