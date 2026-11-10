import { Global, Module } from '@nestjs/common';
import { SqlService } from './sql.service';
import { SqlController } from './sql.controller';

@Global()
@Module({
  providers: [SqlService],
  controllers: [SqlController],
  exports: [SqlService],
})
export class SqlModule {}
