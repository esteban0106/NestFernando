
export const EnvConfig = () => ({
  environment: process.env.NODE_ENV || 'dev',
  mongodb: process.env.MONGODB_URI,
  port: process.env.PORT || 3000,
  defaultLimit: parseInt(process.env.DEFAULT_LIMIT ?? '10', 10),
  defaultOffset: parseInt(process.env.DEFAULT_OFFSET ?? '0', 10),

});