import { Module } from '@nestjs/common';
import { PartyService } from './party.service';
import { PartyController } from './party.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Party } from './entities/party.entity';
import { PartyMapper } from './party.mapper';
import { WhereParserModule } from '../common/where-parser/where-parser.module';

@Module({
    imports: [SequelizeModule.forFeature([Party]), WhereParserModule],
    exports: [PartyMapper, PartyService],
    controllers: [PartyController],
    providers: [PartyService, PartyMapper],
})
export class PartyModule {}
