export const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
      title: 'Eco-MERCE',
      version: '1.0.0',
      description:
        'This is an ecommerce service',
      license: {
        name: 'GNU General Public License 3.0',
        url: 'https://github.com/edmondhillary/ECO-MMERCE-BACK/master/LICENSE'
      },
      contact: {
        name: 'Github Repository',
        url: 'https://github.com/edmondhillary/ECO-MMERCE-BACK'
      }
    },
    servers: [
      {
        description: 'Production',
        url: 'https://backend-nomadsociety-production.up.railway.app/'
      },
      {
        description: 'Development',
        url: 'https://backend-nomadsociety-development.up.railway.app/'
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