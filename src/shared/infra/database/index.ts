import 'dotenv/config'
import { DataSource } from 'typeorm'
import { Quiz } from './entities/Quiz'
import { Campaign } from './entities/Campaign'
import { CampaignCategory } from './entities/CampaignCategory'
import { MarketNiche } from './entities/MarketNiche'
import { CreateQuizzes20240315150000 } from './migrations/20240315150000-CreateQuizzes'
import { CreateCampaigns20240315150001 } from './migrations/20240315150001-CreateCampaigns'
import { CreateCampaignCategories20250310205022 } from './migrations/20250310205022-CreateCampaignCategories'
import { CreateMarketNiches20250310205045 } from './migrations/20250310205045-CreateMarketNiches'

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT),
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASS,
    database: process.env.DATABASE_NAME,
    entities: [Quiz, Campaign, CampaignCategory, MarketNiche],
    migrations: [
        CreateQuizzes20240315150000,
        CreateCampaigns20240315150001,
        CreateCampaignCategories20250310205022,
        CreateMarketNiches20250310205045,
    ],
}) 