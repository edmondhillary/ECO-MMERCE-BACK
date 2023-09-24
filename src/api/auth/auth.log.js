export function authLog(isOK, message) {
  const timelog = new Date();
  const state = isOK ? 'succeeded' : 'failed';
  return console.log(`SERVERLOG ${timelog} --> Authentication ${state}: ${message}`);
}