import { z } from "zod";

/**
 * User input only. API *responses* are typed from the generated contract and
 * never re-validated at runtime — the server owns that shape.
 *
 * The 8-character minimum mirrors `UserSignupIn` in the backend. Login has no
 * minimum on purpose: accounts created before that rule still have to sign in.
 */
export const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export const signupSchema = z.object({
  full_name: z.string().trim().min(1, "Enter your name.").max(100),
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Use at least 8 characters."),
});

export type LoginForm = z.infer<typeof loginSchema>;
export type SignupForm = z.infer<typeof signupSchema>;
