import jwt from 'jsonwebtoken';

function unauthorized(response) {
  response.status(401);
  response.send('Unauthorized, you need to be logged in');
}

function middleware(request, response, next) {
  // const publicRoutes = [
  //   '/login',
  //   '/register',
  //   '/users/unlock-account/:token'
  // ];
  
  function isPublicRoute(url) {
    const publicRouteRegex = [
      /^\/login$/,
      /^\/register$/,
      /^\/users\/unlock-account\/.+$/,
      /^\/reset-password\/.+$/,
      /^\/users\/resend-unlock-token$/,
     
    ];
  
    return publicRouteRegex.some((regex) => regex.test(url));
  }
  
  
    const isDocsRoute = request.url.includes('/docs');
    const isPublicRoute = isPublicRoute(request.url); // Usa la función aquí
  
    if (isPublicRoute || isDocsRoute) {
      next();
      return;
    }
  const token = request.headers.authorization;
  if (!token) {
    return unauthorized(response);
  }

  jwt.verify(token, process.env.AUTH_SECRET_KEY, (error, payload) => {
    if (error) {
      console.error('ERROR!', error.message);
      return unauthorized(response);
    }

    request.username = payload.username;
    request.userId = payload.userId;

    next();
  });
}

export default middleware;
