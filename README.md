# Bingo DEFC

Web para el Bingo con Andrés de la DEFC.

Al clonar el repositorio, crear un archivo en la raíz `.env` con:

```dotenv
DATABASE_URL=file:db.sqlite
BINGO_PRESENTER_AUTH_TOKEN=passwd
VITE_BACKEND_BASE_URL=http://localhost:3000
```

Después, ejecutar `pnpm i`, `npx prisma generate` y `npx prisma db push`.

Para iniciar el backend, ejecutar `npx nodemon`.

Para iniciar el frontend, ejecutar `pnpm dev`.
