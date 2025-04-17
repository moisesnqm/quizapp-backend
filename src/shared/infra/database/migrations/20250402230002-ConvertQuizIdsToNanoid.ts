import { MigrationInterface, QueryRunner } from "typeorm"
import { nanoid } from 'nanoid'

// Tamanho do NanoID a ser gerado
const NANOID_SIZE = 21;

export class ConvertQuizIdsToNanoid20250402230002 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('Executando migração ConvertQuizIdsToNanoid...');
        
        // Verificar se a tabela quizzes existe antes de prosseguir
        const tableExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'quizzes'
            );
        `);
        
        if (!tableExists[0].exists) {
            console.log('Tabela quizzes não existe, pulando conversão de IDs.');
            return;
        }

        // Alterar temporariamente a coluna para aceitar valores nulos
        // Isso permitirá que adicionemos uma coluna nanoid separada
        await queryRunner.query(`
            ALTER TABLE quizzes
            ADD COLUMN nanoid VARCHAR(21);
        `);

        // Obter todos os quizzes existentes
        const quizzes = await queryRunner.query(`
            SELECT * FROM quizzes;
        `);

        // Se não houver quizzes, não há nada a fazer
        if (quizzes.length === 0) {
            console.log('Não há quizzes para converter.');
            
            // Remover a coluna nanoid, pois não é necessária
            await queryRunner.query(`
                ALTER TABLE quizzes
                DROP COLUMN nanoid;
            `);
            
            return;
        }

        // Preencher a coluna nanoid com valores NanoID para cada quiz
        for (const quiz of quizzes) {
            const newId = nanoid(NANOID_SIZE);
            
            await queryRunner.query(`
                UPDATE quizzes
                SET nanoid = '${newId}'
                WHERE id = '${quiz.id}';
            `);
        }

        // Verificar tabelas relacionadas para atualizar
        // Verificar se a tabela campaigns_quizzes existe
        const campaignsQuizzesExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'campaigns_quizzes'
            );
        `);
        
        // Adicionar coluna nanoid em campaigns_quizzes se existir
        if (campaignsQuizzesExists[0].exists) {
            await queryRunner.query(`
                ALTER TABLE campaigns_quizzes
                ADD COLUMN nanoid VARCHAR(21);
            `);
            
            // Atualizar os valores em campaigns_quizzes com os mesmos nanoids dos quizzes
            for (const quiz of quizzes) {
                await queryRunner.query(`
                    UPDATE campaigns_quizzes
                    SET nanoid = (SELECT nanoid FROM quizzes WHERE id = '${quiz.id}')
                    WHERE quiz_id = '${quiz.id}';
                `);
            }
        }
        
        // Verificar se a tabela quiz_responses existe
        const quizResponsesExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'quiz_responses'
            );
        `);
        
        // Adicionar coluna nanoid em quiz_responses se existir
        if (quizResponsesExists[0].exists) {
            await queryRunner.query(`
                ALTER TABLE quiz_responses
                ADD COLUMN nanoid VARCHAR(21);
            `);
            
            // Atualizar os valores em quiz_responses com os mesmos nanoids dos quizzes
            for (const quiz of quizzes) {
                await queryRunner.query(`
                    UPDATE quiz_responses
                    SET nanoid = (SELECT nanoid FROM quizzes WHERE id = '${quiz.id}')
                    WHERE "quizId" = '${quiz.id}';
                `);
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Verificar se a tabela quizzes existe
        const tableExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'quizzes'
            );
        `);
        
        if (!tableExists[0].exists) {
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
            return;
        }
        
        // Remover a coluna nanoid de quizzes
        await queryRunner.query(`
            ALTER TABLE quizzes
            DROP COLUMN nanoid;
        `);
        
        // Verificar tabelas relacionadas
        // Verificar se a tabela campaigns_quizzes existe
        const campaignsQuizzesExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'campaigns_quizzes'
            );
        `);
        
        // Remover coluna nanoid de campaigns_quizzes se existir
        if (campaignsQuizzesExists[0].exists) {
            const columnExists = await queryRunner.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.columns
                    WHERE table_schema = 'public'
                    AND table_name = 'campaigns_quizzes'
                    AND column_name = 'nanoid'
                );
            `);
            
            if (columnExists[0].exists) {
                await queryRunner.query(`
                    ALTER TABLE campaigns_quizzes
                    DROP COLUMN nanoid;
                `);
            }
        }
        
        // Verificar se a tabela quiz_responses existe
        const quizResponsesExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'quiz_responses'
            );
        `);
        
        // Remover coluna nanoid de quiz_responses se existir
        if (quizResponsesExists[0].exists) {
            const columnExists = await queryRunner.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.columns
                    WHERE table_schema = 'public'
                    AND table_name = 'quiz_responses'
                    AND column_name = 'nanoid'
                );
            `);
            
            if (columnExists[0].exists) {
                await queryRunner.query(`
                    ALTER TABLE quiz_responses
                    DROP COLUMN nanoid;
                `);
            }
        }
    }
} 