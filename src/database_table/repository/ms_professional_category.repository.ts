import { EntityRepository, Repository } from "typeorm";
import { ProfessionalCategory } from "../entitites/ms_professional_category.entity";

@EntityRepository(ProfessionalCategory)
export class ProfessionalCategoryRepository extends Repository<ProfessionalCategory> {
    
}