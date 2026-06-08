# Syntara CLI

Herramienta interna de línea de comandos para automatizar tareas comunes en los proyectos web de SyntaraBiz, como la generación de sitemaps, creación de íconos PWA y optimización de imágenes.

## 🚀 Instalación y Uso en Proyectos (Cloudflare Pages)

Al ser este un repositorio público, no necesitas instalar nada localmente ni lidiar con tokens de acceso. Puedes usar `npx` para ejecutar la herramienta directamente desde GitHub en tus comandos de build (por ejemplo, en Cloudflare Pages).

Ejemplo de uso directo en un comando de build:
```bash
npx --yes github:309948/syntara-cli sitemap -d https://midominio.com -o public/sitemap.xml
```
*(El flag `--yes` evita que npx pregunte si deseas instalar el paquete temporalmente).*

---

## 🛠️ Comandos Disponibles

### 1. Generar Sitemap (`sitemap`)
Genera un archivo `sitemap.xml` combinando rutas estáticas y rutas dinámicas (extraídas de un archivo local mediante expresiones regulares).

```bash
npx --yes github:309948/syntara-cli sitemap -d https://midominio.com -o public/sitemap.xml
```

**Opciones:**
- `-d, --domain <url>`: **(Requerido)** Dominio base (ej: https://mimacrochet.com).
- `-f, --file <path>`: Archivo donde buscar IDs dinámicos (ej: src/lib/products.ts).
- `-r, --routes <routes>`: Rutas estáticas separadas por coma (ej: `contacto,sobre-nosotros`).
- `-o, --out <path>`: Ruta de salida. (Por defecto: `public/sitemap.xml`).

### 2. Generar Íconos PWA (`pwa-icons`)
A partir de una sola imagen de alta resolución, genera automáticamente los tamaños requeridos para PWA (192x192 y 512x512).

```bash
npx --yes github:309948/syntara-cli pwa-icons -s src/assets/logo-hq.png -o public/icons
```

**Opciones:**
- `-s, --source <path>`: **(Requerido)** Ruta de la imagen origen.
- `-o, --out <path>`: Carpeta de salida. (Por defecto: `public`).

### 3. Optimizar Imágenes (`optimize-images`)
Busca recursivamente imágenes en formato PNG, JPG o JPEG en un directorio y las convierte a formato WebP optimizado, eliminando las originales (omite archivos que contengan "link_preview").

```bash
npx --yes github:309948/syntara-cli optimize-images -d public/images -q 85
```

**Opciones:**
- `-d, --dir <path>`: **(Requerido)** Directorio a escanear recursivamente.
- `-q, --quality <number>`: Calidad de la compresión de 1 a 100. (Por defecto: `80`).

---

## 🏗️ Guía para Mantener y Añadir Features

Este CLI está construido en **Node.js** utilizando módulos de ES (`"type": "module"`) y se apoya en `commander` para la interfaz de comandos y `sharp` para el procesamiento de imágenes.

### Estructura del Proyecto
```text
syntara-cli/
├── bin/
│   └── syntara.js       # Punto de entrada del ejecutable
├── src/
│   └── commands/        # Lógica individual de cada comando
│       ├── images.js
│       ├── pwa.js
│       └── sitemap.js
├── package.json
└── pnpm-lock.yaml
```

### ¿Cómo crear un nuevo comando?

1. **Crea el archivo de la lógica:** Crea un nuevo archivo en `src/commands/tu-comando.js` exportando una función que reciba el objeto `program`:
   ```javascript
   export function miNuevoComando(program) {
     program
       .command('mi-comando')
       .description('Descripción de lo que hace')
       .option('-o, --opcion <valor>', 'Descripción de la opción')
       .action((options) => {
           console.log("Ejecutando comando...");
       });
   }
   ```

2. **Registra el comando:** Ve a `bin/syntara.js`, importa tu nueva función y regístrala antes de `program.parse()`:
   ```javascript
   import { miNuevoComando } from '../src/commands/tu-comando.js';

   // ... otros comandos ...
   miNuevoComando(program);
   ```

3. **Prueba localmente:** 
   Puedes probar tus cambios localmente en la carpeta del CLI ejecutando:
   ```bash
   node bin/syntara.js mi-comando
   ```

4. **Sube los cambios a GitHub:** 
   Una vez listo, simplemente haz commit y push a la rama `main`. Cualquier proyecto que use el comando mediante `npx github:309948/syntara-cli` descargará la última versión automáticamente.
