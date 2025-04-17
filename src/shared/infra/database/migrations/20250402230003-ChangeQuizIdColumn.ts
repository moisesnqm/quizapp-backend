import { MigrationInterface, QueryRunner } from "typeorm"

export class ChangeQuizIdColumn20250402230003 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('Executando migração ChangeQuizIdColumn...');
        
        // Verificar se a tabela quizzes existe antes de prosseguir
        const tableExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'quizzes'
            );
        `);
        
        if (!tableExists[0].exists) {
            console.log('Tabela quizzes não existe, pulando alteração de tipo de coluna.');
            return;
        }

        // Verificar se a coluna nanoid existe na tabela quizzes
        const columnExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.columns
                WHERE table_schema = 'public'
                AND table_name = 'quizzes'
                AND column_name = 'nanoid'
            );
        `);
        
        if (!columnExists[0].exists) {
            console.log('Coluna nanoid não existe na tabela quizzes. A migração anterior não foi executada corretamente.');
            return;
        }

        try {
            // 1. Identificar e remover todas as restrições de chave estrangeira que apontam para quizzes.id
            const foreignKeys = await queryRunner.query(`
                SELECT 
                    tc.table_schema, 
                    tc.constraint_name, 
                    tc.table_name, 
                    kcu.column_name, 
                    ccu.table_schema AS foreign_table_schema,
                    ccu.table_name AS foreign_table_name,
                    ccu.column_name AS foreign_column_name
                FROM 
                    information_schema.table_constraints AS tc 
                    JOIN information_schema.key_column_usage AS kcu
                        ON tc.constraint_name = kcu.constraint_name
                        AND tc.table_schema = kcu.table_schema
                    JOIN information_schema.constraint_column_usage AS ccu
                        ON ccu.constraint_name = tc.constraint_name
                        AND ccu.table_schema = tc.table_schema
                WHERE 
                    tc.constraint_type = 'FOREIGN KEY' 
                    AND ccu.table_name = 'quizzes'
                    AND ccu.column_name = 'id';
            `);

            // 2. Remover todas as restrições de chave estrangeira
            for (const fk of foreignKeys) {
                await queryRunner.query(`
                    ALTER TABLE ${fk.table_name} 
                    DROP CONSTRAINT "${fk.constraint_name}";
                `);
            }

            // 3. Modificar todas as tabelas relacionadas para usar a coluna nanoid
            const campaignsQuizzesExists = await queryRunner.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'campaigns_quizzes'
                );
            `);
            
            if (campaignsQuizzesExists[0].exists) {
                // Verificar se a coluna nanoid existe
                const columnExists = await queryRunner.query(`
                    SELECT EXISTS (
                        SELECT FROM information_schema.columns
                        WHERE table_schema = 'public'
                        AND table_name = 'campaigns_quizzes'
                        AND column_name = 'nanoid'
                    );
                `);
                
                if (columnExists[0].exists) {
                    // Remover a coluna quiz_id e renomear nanoid para quiz_id
                    await queryRunner.query(`
                        ALTER TABLE campaigns_quizzes
                        DROP COLUMN quiz_id;
                    `);
                    
                    await queryRunner.query(`
                        ALTER TABLE campaigns_quizzes
                        RENAME COLUMN nanoid TO quiz_id;
                    `);
                }
            }
            
            const quizResponsesExists = await queryRunner.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'quiz_responses'
                );
            `);
            
            if (quizResponsesExists[0].exists) {
                // Verificar se a coluna nanoid existe
                const columnExists = await queryRunner.query(`
                    SELECT EXISTS (
                        SELECT FROM information_schema.columns
                        WHERE table_schema = 'public'
                        AND table_name = 'quiz_responses'
                        AND column_name = 'nanoid'
                    );
                `);
                
                if (columnExists[0].exists) {
                    // Remover a coluna quizId e renomear nanoid para quizId
                    await queryRunner.query(`
                        ALTER TABLE quiz_responses
                        DROP COLUMN "quizId";
                    `);
                    
                    await queryRunner.query(`
                        ALTER TABLE quiz_responses
                        RENAME COLUMN nanoid TO "quizId";
                    `);
                }
            }
            
            // 4. Remover a coluna id e renomear nanoid para id na tabela quizzes
            await queryRunner.query(`
                ALTER TABLE quizzes
                DROP COLUMN id;
            `);
            
            await queryRunner.query(`
                ALTER TABLE quizzes
                RENAME COLUMN nanoid TO id;
            `);
            
            // 5. Adicionar chave primária na tabela quizzes
            await queryRunner.query(`
                ALTER TABLE quizzes
                ADD PRIMARY KEY (id);
            `);
            
            // 6. Recriar as restrições de chave estrangeira
            if (campaignsQuizzesExists[0].exists) {
                await queryRunner.query(`
                    ALTER TABLE campaigns_quizzes
                    ADD CONSTRAINT fk_campaigns_quizzes_quiz
                    FOREIGN KEY (quiz_id)
                    REFERENCES quizzes(id);
                `);
            }
            
            if (quizResponsesExists[0].exists) {
                await queryRunner.query(`
                    ALTER TABLE quiz_responses
                    ADD CONSTRAINT fk_quiz_responses_quiz
                    FOREIGN KEY ("quizId")
                    REFERENCES quizzes(id);
                `);
            }
        } catch (error) {
            console.error('Erro ao alterar o tipo da coluna id:', error);
            throw error;
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Esta migração não pode ser revertida facilmente, pois envolveria converter
        // identificadores em formato de string de volta para UUID, o que poderia resultar
        // em perda de dados ou inconsistências.
        console.log('Esta migração não pode ser revertida automaticamente');
    }
} 