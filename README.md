# VERACRUZ360
### Equipo 1 – Halcones | Veracruz Tech Week

## 1. Descripción del proyecto

VERACRUZ360 es una plataforma digital diseñada para facilitar la comunicación entre la ciudadanía y las autoridades mediante el registro y seguimiento de incidencias en espacios públicos.

El sistema permite reportar problemas como baches, luminarias dañadas, acumulación de basura y obstrucciones de vías públicas, proporcionando información y evidencias para facilitar su atención.

## 2. Problema que busca resolver

Actualmente, la ciudadanía enfrenta dificultades para comunicar problemas de su entorno y conocer si estos están siendo atendidos. La falta de un mecanismo accesible de reporte y seguimiento puede provocar que muchas incidencias permanezcan sin solución.

VERACRUZ360 busca reducir esta dificultad mediante una plataforma centralizada que permita registrar reportes, consultar su estado y facilitar su seguimiento.

## 3. Persona usuaria

La plataforma está dirigida principalmente a:

- Ciudadanos de Veracruz que desean reportar problemas en su comunidad.
- Personal administrativo encargado de revisar y gestionar los reportes.
- Autoridades o dependencias responsables de atender las incidencias.

## 4. ¿Cómo se utiliza?

1. El ciudadano ingresa a la plataforma.
2. Accede al apartado de reportes ciudadanos.
3. Describe el problema que desea reportar.
4. Selecciona la categoría correspondiente.
5. Proporciona la ubicación y, cuando sea posible, adjunta fotografías como evidencia.
6. Envía el reporte y obtiene información para consultar su seguimiento.
7. El personal administrativo revisa los reportes y actualiza sus estados.
8. El ciudadano puede consultar los cambios y avances de su reporte.

La plataforma también contempla el uso de inteligencia artificial para apoyar el análisis de fotografías y descripciones de las incidencias.

## 5. Tecnologías utilizadas

| Tecnología | Uso |
|---|---|
| Next.js | Desarrollo de la interfaz y funcionalidades web. |
| React | Construcción de componentes de interfaz. |
| JavaScript | Lógica del frontend. |
| Python y Flask | Backend y panel administrativo. |
| MariaDB | Almacenamiento y administración de información. |
| Google Gemini | Análisis de imágenes y descripciones de incidencias. |
| Google Maps | Visualización y ubicación geográfica de reportes. |
| WhatsApp Business Cloud API | Integración contemplada para notificaciones. |
| Git y GitHub | Control de versiones y colaboración. |
| Ubuntu Server | Entorno de servidor para el proyecto. |

## 6. Instalación y ejecución

### Requisitos previos

- Node.js y npm.
- Python 3.
- MariaDB.
- Git.
- Acceso a las credenciales de los servicios externos utilizados.

### Clonar el repositorio

```bash
git clone URL_DEL_REPOSITORIO
cd Hackaton
```

### Configurar Next.js

```bash
npm install
```

Crear el archivo `.env.local` con las variables de configuración correspondientes:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ciudad360
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
GEMINI_API_KEY=tu_api_key
```

No compartir ni subir las credenciales al repositorio.

### Configurar Flask

Crear un entorno virtual:

```bash
python3 -m venv venv
```

Activarlo en Linux:

```bash
source venv/bin/activate
```

Instalar las dependencias indicadas en el archivo `requirements.txt`, si está incluido:

```bash
pip install -r requirements.txt
```

Configurar las variables de conexión a MariaDB y los servicios externos.

### Ejecutar el proyecto

Iniciar Next.js:

```bash
npm run dev -- --hostname 0.0.0.0
```

Iniciar el panel administrativo Flask desde su directorio y con el comando de ejecución configurado en el proyecto.

Finalmente, acceder desde el navegador a la dirección local o IP del servidor.

## 7. Datos utilizados

VERACRUZ360 trabaja principalmente con información generada durante el registro y seguimiento de incidencias ciudadanas.

Los datos utilizados incluyen:

- Descripción de los problemas reportados.
- Categoría de la incidencia.
- Ubicación geográfica y dirección.
- Fotografías proporcionadas como evidencia.
- Folio y código de seguimiento.
- Estado y prioridad del reporte.
- Información de contacto proporcionada voluntariamente por el ciudadano.
- Historial de seguimiento y actualizaciones.

Google Gemini utiliza las fotografías y descripciones para apoyar el análisis y clasificación de las incidencias. Google Maps permite visualizar su ubicación geográfica.

No se documentó el uso de un conjunto de datos externo específico para entrenar modelos. La información principal proviene de los reportes registrados en la propia plataforma.

## 8. Bitácora de inteligencia artificial

### Raúl Güemes Mosqueda

Herramienta utilizada: Gemini.

Uso: Consultas durante la implementación del código en la máquina virtual y solución de errores e inconsistencias durante las pruebas de funcionamiento.

Decisiones clave: Apoyo en la identificación de errores relacionados con la conexión de la inteligencia artificial con la base de datos y las integraciones de comunicación, como WhatsApp y Gmail.

### Maximiliano Sánchez García

Herramienta utilizada: ChatGPT.

Uso: Apoyo en programación, solución de errores, consultas SQL e integración de WhatsApp.

Decisiones clave: Mejorar el código, detectar errores, optimizar la base de datos y orientar la implementación de nuevas funcionalidades.

### Víctor Arturo Pacheco Ruiz

Herramienta utilizada: ChatGPT.

Uso: Apoyo en la estructura, organización y desarrollo de la página web, principalmente en los apartados de reportes ciudadanos y seguimiento. Ayudó en la implementación de formularios, registro de reportes, consulta de información, actualización de estados y conexión entre frontend, backend y base de datos.

Decisiones clave: Definir la lógica de funcionamiento de los reportes, organizar las API, mejorar la comunicación entre componentes, solucionar errores y optimizar el funcionamiento de la plataforma.

### Benjamín Alan Crisanto Díaz

Herramienta utilizada: Gemini.

Uso: Apoyo para conectar la base de datos con la página web y reflejar los movimientos realizados en el sistema. También se utilizó para integrar Google Maps y mejorar la precisión de la ubicación de los reportes, además de resolver errores durante el desarrollo.

Decisiones clave: Mejorar la comunicación entre la página web y la base de datos, integrar el mapa y corregir inconsistencias de funcionamiento.

### Bryan Ramírez Robles

Herramienta utilizada: ChatGPT.

Uso: Apoyo para montar un servidor en una máquina virtual, encontrar y corregir errores, y resolver dudas sobre comandos y administración de repositorios en GitHub.

Decisiones clave: Facilitar la configuración del servidor, solucionar problemas técnicos y apoyar la colaboración mediante el control de versiones.

## 9. Criterio general del equipo sobre el uso de IA

Las herramientas de inteligencia artificial se utilizaron como apoyo para programación, análisis de errores, documentación y propuestas de soluciones técnicas.

Las decisiones de implementación, integración y entrega quedaron bajo la responsabilidad de los integrantes del equipo. El código generado o sugerido mediante IA debía ser revisado y adaptado a los requisitos del proyecto.

La inteligencia artificial también forma parte de VERACRUZ360 mediante Google Gemini, utilizado para analizar fotografías y descripciones de incidencias, apoyar su clasificación y proponer prioridades de atención.

## 10. Integrantes del equipo

**Equipo 1 – Halcones**

1. Raúl Güemes Mosqueda
2. Bryan Ramírez Robles
3. Víctor Arturo Pacheco Ruiz
4. Benjamín Alan Crisanto Díaz
5. Maximiliano Sánchez García

---

Desarrollado para Veracruz Tech Week.

**VERACRUZ360 – Una ciudad mejor comienza con ciudadanos que pueden ser escuchados.**
