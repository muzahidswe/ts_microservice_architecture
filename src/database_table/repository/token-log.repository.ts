import {EntityRepository, Repository} from "typeorm";
import { TokenLog } from "../entitites/token-log.entity";

@EntityRepository(TokenLog)
export class TokenLogRepository extends Repository<TokenLog> {

}