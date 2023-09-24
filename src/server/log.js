
export default function log(request, response, next) {
  const url = request.url;
  const method = request.method;
  const params = JSON.stringify(request.params);
  const query = JSON.stringify(request.query);
  const timelog = new Date();

  console.log(`SERVERLOG ${timelog} --> Listening to petition: [ URL: ${url} // METHOD: ${method} // QUERY: ${query} // PARAMS: ${params} ]`);
  
  next();
}