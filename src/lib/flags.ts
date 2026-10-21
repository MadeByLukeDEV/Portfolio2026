/** Set PASSWORD_LOGIN_ENABLED=false once a hardware key is registered. */
export const passwordLoginEnabled = process.env.PASSWORD_LOGIN_ENABLED !== "false";
