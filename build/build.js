import * as fs from 'fs/promises'; // Para fs con promesas
import util from 'util'; // Para util
import { exec } from 'child_process'; // Para child_process

async function build() {
  try {
    // Ejecuta los comandos de construcción que necesites aquí
    // Por ejemplo, si estás utilizando npm:
    await exec('npm install'); // Instala dependencias
    await exec('npm run build'); // Ejecuta tu proceso de construcción
    
    // Mueve los archivos construidos a la carpeta "build"
    await fs.rename('ruta/a/tu/archivo/construido', 'build/tu-archivo-construido');

    console.log('Construcción completada.');
  } catch (error) {
    console.error('Error durante la construcción:', error);
  }
}

// Llama a la función de construcción
build();
