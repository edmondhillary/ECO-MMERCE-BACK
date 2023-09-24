export function databaseLog(db, collection, opType, docKey) {
  const timelog = new Date();
  return console.log(`SERVERLOG ${timelog} --> Database operation: [ DATABASE: ${db} // COLLECTION: ${collection} // OP_TYPE: ${opType} // DOC_KEY: ${docKey} ]`)
}