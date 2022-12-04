import { EntityRepository, Repository } from "typeorm";
import { PromotionCategory } from "../entitites/ms_promotion_category.entity";

@EntityRepository(PromotionCategory)
export class PromotionCategoryRepository extends Repository<PromotionCategory> {
    
}