import { MigrationInterface, QueryRunner } from "typeorm"
import { nanoid } from 'nanoid'

// Novo tamanho do NanoID
const NEW_NANOID_SIZE = 8;

export class ResizeQuizIdColumn20250402230004 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('Executando migração ResizeQuizIdColumn...');
        
        // Verificar se a tabela quizzes existe
        const tableExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'quizzes'
            );
        `);
        
        if (!tableExists[0].exists) {
            console.log('Tabela quizzes não existe, pulando ajuste de tamanho da coluna.');
            return;
        }
        
        try {
            // 1. Verificar o tamanho atual da coluna id
            const columnLength = await queryRunner.query(`
                SELECT character_maximum_length
                FROM information_schema.columns 
                WHERE table_schema = 'public'
                AND table_name = 'quizzes' 
                AND column_name = 'id';
            `);
            
            if (columnLength.length === 0 || columnLength[0].character_maximum_length === NEW_NANOID_SIZE) {
                console.log(`A coluna id já possui o tamanho ${NEW_NANOID_SIZE}, pulando alteração.`);
                return;
            }
            
            // 2. Verificar as tabelas relacionadas
            console.log('Verificando tabelas relacionadas...');
            
            const quizResponsesExists = await queryRunner.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'quiz_responses'
                );
            `);
            
            const campaignsQuizzesExists = await queryRunner.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'campaigns_quizzes'
                );
            `);
            
            // 3. Remover as chaves estrangeiras específicas
            if (quizResponsesExists[0].exists) {
                console.log('Removendo FK da tabela quiz_responses...');
                await queryRunner.query(`
                    ALTER TABLE quiz_responses 
                    DROP CONSTRAINT IF EXISTS fk_quiz_responses_quiz;
                `);
            }
            
            if (campaignsQuizzesExists[0].exists) {
                console.log('Removendo FK da tabela campaigns_quizzes...');
                await queryRunner.query(`
                    ALTER TABLE campaigns_quizzes 
                    DROP CONSTRAINT IF EXISTS fk_campaigns_quizzes_quiz;
                `);
            }
            
            // 4. Identificar e remover quaisquer outras restrições de chave estrangeira que possam existir
            const foreignKeys = await queryRunner.query(`
                SELECT 
                    tc.constraint_name, 
                    tc.table_name
                FROM 
                    information_schema.table_constraints AS tc 
                    JOIN information_schema.constraint_column_usage AS ccu
                        ON ccu.constraint_name = tc.constraint_name
                WHERE 
                    tc.constraint_type = 'FOREIGN KEY' 
                    AND ccu.table_name = 'quizzes'
                    AND ccu.column_name = 'id';
            `);
            
            for (const fk of foreignKeys) {
                console.log(`Removendo restrição ${fk.constraint_name} da tabela ${fk.table_name}...`);
                await queryRunner.query(`
                    ALTER TABLE ${fk.table_name} 
                    DROP CONSTRAINT "${fk.constraint_name}";
                `);
            }
            
            // 5. Agora podemos remover a restrição de chave primária
            console.log('Removendo chave primária da tabela quizzes...');
            await queryRunner.query(`
                ALTER TABLE quizzes 
                DROP CONSTRAINT quizzes_pkey;
            `);
            
            // 6. Alterar o tipo da coluna
            console.log(`Alterando o tipo da coluna id para VARCHAR(${NEW_NANOID_SIZE})...`);
            
            // Obter todos os quizzes existentes
            const quizzes = await queryRunner.query(`
                SELECT id FROM quizzes;
            `);
            
            // Criar uma tabela temporária com a nova estrutura
            await queryRunner.query(`
                CREATE TABLE quizzes_temp (
                    id VARCHAR(${NEW_NANOID_SIZE}) PRIMARY KEY,
                    title VARCHAR NOT NULL,
                    subject VARCHAR,
                    description VARCHAR NOT NULL,
                    "managerId" VARCHAR NOT NULL,
                    content JSONB NOT NULL,
                    status VARCHAR NOT NULL,
                    "startDate" TIMESTAMP NOT NULL,
                    "endDate" TIMESTAMP NOT NULL,
                    "createdAt" TIMESTAMP NOT NULL
                );
            `);
            
            // Inserir os dados na tabela temporária com novos IDs
            const idMapping: Record<string, string> = {};
            
            for (const quiz of quizzes) {
                const oldId = quiz.id;
                const newId = nanoid(NEW_NANOID_SIZE);
                idMapping[oldId] = newId;
                
                await queryRunner.query(`
                    INSERT INTO quizzes_temp 
                    SELECT 
                        '${newId}' as id, 
                        title, 
                        subject, 
                        description, 
                        "managerId", 
                        content, 
                        status, 
                        "startDate", 
                        "endDate", 
                        "createdAt"
                    FROM quizzes
                    WHERE id = '${oldId}';
                `);
            }
            
            // Atualizar referências nas tabelas relacionadas
            if (quizResponsesExists[0].exists) {
                for (const oldId in idMapping) {
                    await queryRunner.query(`
                        UPDATE quiz_responses
                        SET "quizId" = '${idMapping[oldId]}'
                        WHERE "quizId" = '${oldId}';
                    `);
                }
            }
            
            if (campaignsQuizzesExists[0].exists) {
                for (const oldId in idMapping) {
                    await queryRunner.query(`
                        UPDATE campaigns_quizzes
                        SET quiz_id = '${idMapping[oldId]}'
                        WHERE quiz_id = '${oldId}';
                    `);
                }
            }
            
            // Renomear as tabelas
            await queryRunner.query(`DROP TABLE quizzes;`);
            await queryRunner.query(`ALTER TABLE quizzes_temp RENAME TO quizzes;`);
            
            // Recriar as restrições de chave estrangeira
            if (quizResponsesExists[0].exists) {
                await queryRunner.query(`
                    ALTER TABLE quiz_responses
                    ADD CONSTRAINT fk_quiz_responses_quiz
                    FOREIGN KEY ("quizId")
                    REFERENCES quizzes(id);
                `);
            }
            
            if (campaignsQuizzesExists[0].exists) {
                await queryRunner.query(`
                    ALTER TABLE campaigns_quizzes
                    ADD CONSTRAINT fk_campaigns_quizzes_quiz
                    FOREIGN KEY (quiz_id)
                    REFERENCES quizzes(id);
                `);
            }
            
            console.log(`Migração concluída com sucesso. Coluna id redimensionada para ${NEW_NANOID_SIZE} caracteres.`);
        } catch (error) {
            console.error('Erro ao redimensionar a coluna id:', error);
            throw error;
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Esta migração não pode ser revertida facilmente sem perda de dados
        console.log('A migração de redimensionamento da coluna ID não pode ser revertida automaticamente.');
    }
} 