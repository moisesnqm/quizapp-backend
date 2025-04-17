#!/bin/bash

echo "Executando migrações..."
npx typeorm-ts-node-commonjs migration:run -d src/shared/infra/database/index.ts

echo "Verificando status das migrações..."
npx typeorm-ts-node-commonjs migration:show -d src/shared/infra/database/index.ts 