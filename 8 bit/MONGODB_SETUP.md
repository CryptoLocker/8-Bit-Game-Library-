# 🎮 Guía de Configuración de MongoDB - 8 Bit Game Library

## 📋 Tabla de Contenidos
1. [Crear cuenta en MongoDB Atlas](#1-crear-cuenta-en-mongodb-atlas)
2. [Configurar tu cluster](#2-configurar-tu-cluster)
3. [Obtener la cadena de conexión](#3-obtener-la-cadena-de-conexión)
4. [Configurar variables de entorno](#4-configurar-variables-de-entorno)
5. [Inicializar la base de datos](#5-inicializar-la-base-de-datos)
6. [Probar la aplicación](#6-probar-la-aplicación)

---

## 1. Crear cuenta en MongoDB Atlas

1. Ve a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Regístrate con tu email o cuenta de Google/GitHub
3. Completa el proceso de registro (es gratis)

---

## 2. Configurar tu cluster

### 2.1 Crear un nuevo cluster
1. Después de iniciar sesión, haz clic en **"Build a Database"**
2. Selecciona **"FREE"** (M0 Sandbox) - es completamente gratis
3. Elige tu proveedor cloud:
   - **AWS** (recomendado)
   - Google Cloud
   - Azure
4. Selecciona la región más cercana a ti (ej: `us-east-1` para USA)
5. Dale un nombre a tu cluster (ej: `GameTracker`)
6. Haz clic en **"Create Deployment"**

### 2.2 Configurar usuario de base de datos
1. Te pedirá crear un usuario:
   - **Username**: `gametracker-user` (o el que prefieras)
   - **Password**: Genera una contraseña segura (¡guárdala!) 
   - contraseña: **"EQrZo04SFvhwr3Y4"**
   - Haz clic en **"Create Database User"**

### 2.3 Configurar acceso de red
1. En "Where would you like to connect from?"
2. Selecciona **"My Local Environment"**
3. Haz clic en **"Add My Current IP Address"** (esto permite conexiones desde tu computadora)
4. Para desarrollo, puedes agregar `0.0.0.0/0` (permite todas las IPs) - **No recomendado para producción**
5. Haz clic en **"Finish and Close"**

---

## 3. Obtener la cadena de conexión

1. En el dashboard de MongoDB Atlas, haz clic en **"Connect"** en tu cluster
2. Selecciona **"Connect your application"**
3. Elige:
   - **Driver**: Node.js
   - **Version**: 5.5 or later
4. Copia la cadena de conexión (se verá así):

```
mongodb+srv://gametracker-user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

5. **IMPORTANTE**: Reemplaza `<password>` con tu contraseña real

---

## 4. Configurar variables de entorno

1. Abre el archivo `.env.local` en la raíz de tu proyecto
2. Reemplaza la cadena de conexión con la tuya:

```env
# MongoDB Connection String
MONGODB_URI=mongodb+srv://gametracker-user:TU_PASSWORD_AQUI@cluster0.xxxxx.mongodb.net/gametracker?retryWrites=true&w=majority

# Nombre de la base de datos
MONGODB_DB=gametracker
```

**Ejemplo real:**
```env
MONGODB_URI=mongodb+srv://gametracker-user:MySecurePass123@cluster0.abc123.mongodb.net/gametracker?retryWrites=true&w=majority
MONGODB_DB=gametracker
```

3. Guarda el archivo

---

## 5. Inicializar la base de datos

Ahora vamos a configurar los índices de la base de datos:

```powershell
# Instalar tsx si no lo tienes
pnpm add -D tsx

# Ejecutar el script de inicialización
pnpm exec tsx scripts/init-db.ts
```

Deberías ver algo así:
```
🚀 Iniciando configuración de MongoDB...

📊 Creando índices...
✅ MongoDB indexes initialized successfully

🔍 Verificando conexión...
✅ Colecciones disponibles: games, reviews

📈 Estadísticas actuales:
   - Juegos: 0
   - Reseñas: 0

✅ ¡Base de datos configurada exitosamente!
```

---

## 6. Probar la aplicación

### 6.1 Iniciar el servidor de desarrollo
```powershell
pnpm dev
```

### 6.2 Probar los endpoints

**Crear un juego:**
```powershell
# PowerShell
Invoke-RestMethod -Uri "http://localhost:3000/api/games" -Method POST -Body (@{
  title = "The Legend of Zelda"
  coverUrl = "https://example.com/zelda.jpg"
  status = "playing"
  hoursPlayed = 10
  rating = 5
} | ConvertTo-Json) -ContentType "application/json"
```

**Obtener todos los juegos:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/games" -Method GET
```

### 6.3 Verificar en MongoDB Atlas
1. Ve a tu cluster en MongoDB Atlas
2. Haz clic en **"Browse Collections"**
3. Deberías ver:
   - Colección `games` con tus juegos
   - Colección `reviews` (vacía por ahora)

---

## 🎯 Endpoints API Disponibles

### Games
- `GET /api/games` - Obtener todos los juegos
- `GET /api/games/:id` - Obtener un juego específico
- `POST /api/games` - Crear un nuevo juego
- `PUT /api/games/:id` - Actualizar un juego
- `DELETE /api/games/:id` - Eliminar un juego

### Reviews
- `GET /api/reviews` - Obtener todas las reseñas
- `GET /api/reviews/:id` - Obtener una reseña específica
- `POST /api/reviews` - Crear una nueva reseña
- `PUT /api/reviews/:id` - Actualizar una reseña
- `DELETE /api/reviews/:id` - Eliminar una reseña

### Stats
- `GET /api/stats` - Obtener estadísticas agregadas

---

## ❓ Solución de Problemas

### Error: "MongoServerError: bad auth"
- Verifica que tu contraseña sea correcta en `.env.local`
- Asegúrate de haber URL-encoded caracteres especiales

### Error: "Connection timeout"
- Verifica que tu IP esté en la lista de IPs permitidas en MongoDB Atlas
- Revisa tu conexión a internet

### Error: "MONGODB_URI is not defined"
- Asegúrate de que el archivo `.env.local` existe
- Verifica que la variable esté correctamente escrita
- Reinicia el servidor de desarrollo

### La aplicación no muestra datos
- Verifica que hayas ejecutado `init-db.ts`
- Revisa la consola del servidor por errores
- Verifica en MongoDB Atlas que los datos existen

---

## 🚀 Siguiente Paso: Desplegar a Producción

Cuando estés listo para producción:

1. **Vercel/Railway/Render**: Agrega la variable `MONGODB_URI` en las variables de entorno
2. **Whitelist de IPs**: En MongoDB Atlas, actualiza las IPs permitidas para incluir las de tu servicio de hosting
3. **Seguridad**: Usa contraseñas fuertes y nunca compartas tu `.env.local`

---

## 📞 Soporte

Si tienes problemas:
1. Revisa esta guía nuevamente
2. Verifica los logs del servidor
3. Consulta la documentación de [MongoDB Atlas](https://docs.atlas.mongodb.com/)

¡Feliz desarrollo! 🎮
