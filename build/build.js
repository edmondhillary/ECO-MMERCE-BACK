
async function build() {
  try {
    // Ejecuta los comandos de construcción que necesites aquí
    // Por ejemplo, si estás utilizando npm:
    await exec('npm install'); // Instala dependencias
    await exec('npm run build'); // Ejecuta tu proceso de construcción
    
  

    console.log('Construcción completada.');
  } catch (error) {
    console.error('Error durante la construcción:', error);
  }
}

// Llama a la función de construcción
build();
