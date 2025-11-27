================================================================================
                   DOCUMENTACIÓN DE MIGRACIÓN A MONGODB
                   GameTracker - 8 Bit Game Library
================================================================================

/* DESCRIPCIÓN GENERAL
   Este documento especifica cómo configurar MongoDB para almacenar los datos
   de la aplicación GameTracker. Los datos actualmente se guardan en localStorage
   del navegador y necesitan ser migrados a una base de datos centralizada en
   el servidor usando MongoDB.
*/

================================================================================
ESTRUCTURA DE DATOS Y COLECCIONES MONGODB
================================================================================

1. COLECCIÓN: "games"
   Descripción: Almacena todos los videojuegos de la biblioteca del usuario
   
   Estructura del documento:
   {
     "_id": ObjectId,
     "title": string (REQUERIDO) - Nombre del juego
     "coverUrl": string (REQUERIDO) - URL de la portada del juego
     "description": string - Descripción del juego
     "developer": string - Nombre del desarrollador
     "publisher": string - Nombre de la editorial
     "status": string (REQUERIDO) - Estado: "playing" | "completed" | "backlog"
     "hoursPlayed": number (REQUERIDO) - Horas jugadas
     "rating": number (opcional) - Calificación 0-5
     "genres": [string] - Array de géneros (ej: ["RPG", "Action"])
     "platforms": [string] - Plataformas disponibles (ej: ["PC", "PlayStation"])
     "releaseDate": string - Fecha de lanzamiento (ISO format: YYYY-MM-DD)
     "source": string - Origen: "manual" (ahora sin steam/igdb)
     "externalId": string - ID externo (ya no se usa, mantener por compatibilidad)
     "isNew": boolean - Flag para juegos recientemente añadidos
     "createdAt": Date - Fecha de creación en la app
     "updatedAt": Date - Última actualización
     "userId": string (REQUERIDO) - ID del usuario propietario
   }
   
   Índices recomendados:
   - db.games.createIndex({ "userId": 1 })
   - db.games.createIndex({ "userId": 1, "status": 1 })
   - db.games.createIndex({ "createdAt": -1 })

---

2. COLECCIÓN: "reviews"
   Descripción: Almacena las reseñas y comentarios sobre los juegos
   
   Estructura del documento:
   {
     "_id": ObjectId,
     "gameId": string (REQUERIDO) - ObjectId de referencia a la colección games
     "userId": string (REQUERIDO) - ID del usuario que escribió la reseña
     "gameTitle": string - Nombre del juego (desnormalizado para rapidez)
     "gameCover": string - URL de portada (desnormalizado)
     "rating": number (REQUERIDO) - Calificación 0-5
     "content": string (REQUERIDO) - Texto de la reseña
     "createdAt": Date - Fecha de creación
     "updatedAt": Date - Última actualización
   }
   
   Índices recomendados:
   - db.reviews.createIndex({ "userId": 1 })
   - db.reviews.createIndex({ "gameId": 1 })
   - db.reviews.createIndex({ "userId": 1, "createdAt": -1 })

================================================================================
ENDPOINTS API QUE SE VAN A CREAR/ACTUALIZAR
================================================================================

GAMES ENDPOINTS:
- GET    /api/games              - Obtener todos los juegos del usuario
- GET    /api/games/:id          - Obtener un juego específico
- POST   /api/games              - Crear un nuevo juego
- PUT    /api/games/:id          - Actualizar un juego
- DELETE /api/games/:id          - Eliminar un juego

REVIEWS ENDPOINTS:
- GET    /api/reviews            - Obtener todas las reseñas del usuario
- GET    /api/reviews/:id        - Obtener una reseña específica
- POST   /api/reviews            - Crear una nueva reseña
- PUT    /api/reviews/:id        - Actualizar una reseña
- DELETE /api/reviews/:id        - Eliminar una reseña

================================================================================
PROCESO DE INTEGRACIÓN EN LA APP
================================================================================

PASO 1: CONFIGURAR MONGODB
   1. Crear una base de datos en MongoDB Atlas
   2. Obtener la cadena de conexión (MONGODB_URI)
   3. Guardar en variables de entorno: MONGODB_URI
   4. Crear un archivo "lib/mongodb.ts" con la conexión

PASO 2: ACTUALIZAR HOOKS
   Los hooks actuales (useGames, useReviews, useLocalStorage) necesitarán
   cambios mínimos:
   - En lugar de leer/escribir localStorage, harán llamadas a la API
   - El código de la UI se mantiene prácticamente igual
   - Solo cambia cómo se persisten los datos

PASO 3: MIGRACIÓN DE DATOS
   1. Exportar datos de localStorage como JSON
   2. Transformar formato a documentos MongoDB
   3. Ejecutar script de inserción en MongoDB
   4. Validar que todos los datos fueron migrados correctamente

PASO 4: REEMPLAZAR API CLIENT
   El archivo "lib/api-client.ts" ya tiene la estructura correcta.
   Solo necesita apuntar a los nuevos endpoints de MongoDB.

PASO 5: ACTUALIZAR RUTAS API
   Crear/actualizar los archivos:
   - app/api/games/route.ts (GET, POST)
   - app/api/games/[id]/route.ts (GET, PUT, DELETE)
   - app/api/reviews/route.ts (GET, POST)
   - app/api/reviews/[id]/route.ts (GET, PUT, DELETE)

PASO 6: TESTING
   1. Probar CRUD operations para games
   2. Probar CRUD operations para reviews
   3. Verificar sincronización en tiempo real con websockets (opcional)
   4. Probar cálculo de estadísticas con datos de MongoDB

================================================================================
COMPARATIVA: LOCALSTORAGE vs MONGODB
================================================================================

ANTES (LocalStorage):
- Datos guardados en navegador
- Límite ~5MB
- Sincronización manual entre pestañas
- Pérdida de datos si se borra cache del navegador
- Sin autenticación

DESPUÉS (MongoDB):
- Datos centralizados en servidor
- Sin límite de almacenamiento
- Sincronización automática y en tiempo real
- Datos persistentes y seguros
- Implementar autenticación de usuario
- Mejor rendimiento en consultas complejas (estadísticas)

================================================================================
VARIABLES DE ENTORNO NECESARIAS
================================================================================

MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gametracker

Ejemplo con MongoDB Atlas:
MONGODB_URI=mongodb+srv://user:pass@cluster0.abc123.mongodb.net/gametracker?retryWrites=true&w=majority

================================================================================
SCRIPT SQL/AGREGACIÓN PARA ESTADÍSTICAS
================================================================================

/* Calcular estadísticas totales del usuario */
db.games.aggregate([
  { $match: { userId: "user_id_aqui" } },
  {
    $group: {
      _id: null,
      totalGames: { $sum: 1 },
      completedGames: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
      playingGames: { $sum: { $cond: [{ $eq: ["$status", "playing"] }, 1, 0] } },
      backlogGames: { $sum: { $cond: [{ $eq: ["$status", "backlog"] }, 1, 0] } },
      totalHours: { $sum: "$hoursPlayed" },
      averageRating: { $avg: "$rating" }
    }
  }
])

/* Obtener juegos por género */
db.games.aggregate([
  { $match: { userId: "user_id_aqui" } },
  { $unwind: "$genres" },
  {
    $group: {
      _id: "$genres",
      count: { $sum: 1 },
      totalHours: { $sum: "$hoursPlayed" },
      avgRating: { $avg: "$rating" }
    }
  },
  { $sort: { count: -1 } }
])

/* Obtener juegos por plataforma */
db.games.aggregate([
  { $match: { userId: "user_id_aqui" } },
  { $unwind: "$platforms" },
  {
    $group: {
      _id: "$platforms",
      count: { $sum: 1 },
      totalHours: { $sum: "$hoursPlayed" }
    }
  }
])

================================================================================
ARCHIVOS A CREAR/MODIFICAR
================================================================================

CREAR:
- lib/mongodb.ts (conexión a MongoDB)
- app/api/games/route.ts
- app/api/games/[id]/route.ts
- app/api/reviews/route.ts
- app/api/reviews/[id]/route.ts
- scripts/migrate-localstorage-to-mongodb.ts (migración de datos)

MODIFICAR:
- lib/api-client.ts (ya está listo, solo ajustar endpoints)
- hooks/use-games.ts (cambiar localStorage por API)
- hooks/use-reviews.ts (cambiar localStorage por API)
- app/library/page.tsx (agregar manejo de errores de servidor)
- app/stats/page.tsx (agregar manejo de errores de servidor)

MANTENER IGUAL:
- Todos los componentes UI
- app/landing/page.tsx
- Lógica de estadísticas
- Efectos visuales

================================================================================
PRÓXIMOS PASOS
================================================================================

1. Configurar MongoDB Atlas / Neon PostgreSQL
2. Crear archivo de conexión "lib/mongodb.ts"
3. Generar las rutas API REST
4. Actualizar hooks para usar API en lugar de localStorage
5. Crear script de migración de datos
6. Testing completo de funcionalidad
7. Deploy a producción

================================================================================
