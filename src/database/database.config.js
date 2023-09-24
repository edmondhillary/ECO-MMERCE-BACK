export const MongoDB = {
  market: {
    uri: process.env.MONGO_URL,
    config:{
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'ecoDent',
    }
  }
}
