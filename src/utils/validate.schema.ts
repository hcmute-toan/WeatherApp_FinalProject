import React from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";

export const LoginSchema = Yup.object().shape({
  password: Yup.string()
    .min(6, "Password need 6 character !")
    .max(50, "Too Long!")
    .required("Password is not empty"),
  email: Yup.string().email("Invalid email").required("Name is not empty"),
});
export const UpdateAccountSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must not exceed 50 characters")
    .required("Name is required"),
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  phone: Yup.string()
    .matches(
      /^[0-9]{7,15}$/,
      "Phone number must be 7–15 digits and contain only numbers"
    )
    .required("Phone is required"),
});
export const SignupSchema = Yup.object().shape({
  password: Yup.string()
    .min(6, "Password need 6 character !")
    .max(50, "Too Long!")
    .required("Password is not empty"),
  name: Yup.string()
    .min(2, "Name need 2 character !")
    .max(50, "Too Long!")
    .required("Name is not empty"),
  email: Yup.string().email("Invalid email").required("email is not empty"),
});
export const UpdateUserPasswordSchema = Yup.object().shape({
  currentPassword: Yup.string()
    .min(6, "currentPassword need 6 character")
    .max(50, "currentPassword max 50 character")
    .required("currentPassword not empty"),
  newPassword: Yup.string()
    .min(6, "newPassword need 6 character")
    .max(50, "newPassword max 50 character")
    .required("newPassword not empty"),
  confirmNewPassword: Yup.string()
    .required("confirmNewPassword not empty")
    .oneOf([Yup.ref("newPassword")], "Passwords must match"),
});
export const ResetPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
});
export const ForgotPassword = Yup.object().shape({
  newPassword: Yup.string()
    .min(6, "newPassword need 6 character")
    .max(50, "newPassword max 50 character")
    .required("newPassword not empty"),
  confirmNewPassword: Yup.string()
    .required("confirmNewPassword not empty")
    .oneOf([Yup.ref("newPassword")], "Passwords must match"),
  code: Yup.string().required("code is not empty"),
});
