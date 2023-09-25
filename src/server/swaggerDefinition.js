export const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
      title: 'Eco-MERCE',
      version: '1.0.0',
      description:
        'This is an ecommerce service',
      license: {
        name: 'GNU General Public License 3.0',
        url: 'https://github.com/edmondhillary/ECO-MMERCE-BACK/blob/master/LICENSE'
      },
      contact: {
        name: 'Github Repository',
        url: 'https://github.com/edmondhillary/ECO-MMERCE-BACK'
      }
    },
    servers: [
      {
        description: 'Production',
        url: 'por definirrrrrr'
      },
      {
        description: 'Development',
        url: 'por definir'
      },
      {
        description: 'Local Host',
        url: 'http://localhost:3003/'
      },
    ],
    components: {
      securitySchemes: {
        "token": {
          type: "apiKey",
          name: "Authorization",
          in: "header"
        }
      }
    }
  };