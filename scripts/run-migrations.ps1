Write-Host "Executando migrações..." -ForegroundColor Green
npx typeorm-ts-node-commonjs migration:run -d src/shared/infra/database/index.ts

Write-Host "Verificando status das migrações..." -ForegroundColor Green
npx typeorm-ts-node-commonjs migration:show -d src/shared/infra/database/index.ts 