// shared/message-patterns.ts
export const RabbitMQMessagePatterns = {
  SIGNUP: 'SIGN_UP',
  LOGIN: 'LOGIN',
  REFRESH_TOKEN: 'REFRESH_TOKEN',
  RESET_PASSWORD: 'RESET_PASSWORD',
  LOGOUT: 'LOGOUT',
  VERIFY_USER: 'VERIFY_USER',
  VALIDATE_USER: 'VALIDATE_USER',

  DATABASE_QUERY: {
    DATABASE_EMAIL_EXIST: 'database_email_exist',
    DATABASE_UUID_EXIST: 'database_uuid_exist',
    DATABASE_CREATE_NEW_USER: 'database_create_new_user',
    DATABASE_ADD_REFRESH_TOKEN: 'database_add_refresh_token',
    DATABASE_UPDATE_VALUE: 'database_update_value',
    DATABASE_VALUE_EXIST: 'database_value_exist',
    DATABASE_USER_ID_EXIST: 'database_user_id_exist',
    DATABASE_FETCH_BY_EMAIL: 'database_fetch_by_email',
  },
};
