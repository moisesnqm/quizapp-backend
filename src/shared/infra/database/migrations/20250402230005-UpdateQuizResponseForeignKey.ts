import { MigrationInterface, QueryRunner } from "typeorm"

export class UpdateQuizResponseForeignKey20250402230005 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('Executando migração UpdateQuizResponseForeignKey...');
        
        // Verificar se a tabela quiz_responses existe
        const tableExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'quiz_responses'
            );
        `);
        
        if (!tableExists[0].exists) {
            console.log('Tabela quiz_responses não existe, pulando atualização de chave estrangeira.');
            return;
        }
        
        try {
            // Verificar se a chave estrangeira existe
            const fkExists = await queryRunner.query(`
                SELECT constraint_name
                FROM information_schema.table_constraints
                WHERE table_name = 'quiz_responses'
                AND constraint_type = 'FOREIGN KEY'
                AND constraint_name = 'fk_quiz_responses_quiz';
            `);
            
            // Remover a chave estrangeira se existir
            if (fkExists.length > 0) {
                await queryRunner.query(`
                    ALTER TABLE quiz_responses
                    DROP CONSTRAINT fk_quiz_responses_quiz;
                `);
                console.log('Chave estrangeira removida com sucesso.');
            }
            
            // Verificar o tipo atual da coluna quizId
            const columnType = await queryRunner.query(`
                SELECT data_type, character_maximum_length
                FROM information_schema.columns
                WHERE table_name = 'quiz_responses'
                AND column_name = 'quizId';
            `);
            
            // Atualizar o tipo da coluna para varchar(8) se necessário
            if (columnType.length > 0) {
                const currentType = columnType[0].data_type;
                const currentLength = columnType[0].character_maximum_length;
                
                if (currentType !== 'character varying' || currentLength !== 8) {
                    await queryRunner.query(`
                        ALTER TABLE quiz_responses
                        ALTER COLUMN "quizId" TYPE VARCHAR(8);
                    `);
                    console.log('Tipo da coluna quizId atualizado para VARCHAR(8).');
                }
            }
            
            // Recriar a chave estrangeira
            await queryRunner.query(`
                ALTER TABLE quiz_responses
                ADD CONSTRAINT fk_quiz_responses_quiz
                FOREIGN KEY ("quizId")
                REFERENCES quizzes(id);
            `);
            
            console.log('Chave estrangeira recriada com sucesso.');
        } catch (error) {
            console.error('Erro ao atualizar a chave estrangeira:', error);
            throw error;
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log('Reversão não implementada para UpdateQuizResponseForeignKey.');
    }
} 