import { EntityRepository, Repository } from "typeorm";
import { MsPdoWisePromotionLimit } from "../entitites/ms-pdo-wise-promotion-limit.entity";

@EntityRepository(MsPdoWisePromotionLimit)
export class MsPdoWisePromotionLimitRepository extends Repository<MsPdoWisePromotionLimit> {
    
}