exports.determineAllowedOrigins = () => {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    return [
      'https://raia-client-git-main-nicmackenzie.vercel.app',
      'https://raia-client-30voecu6m-nicmackenzie.vercel.app',
    ];
  }
  return ['http://localhost:5173'];
};
