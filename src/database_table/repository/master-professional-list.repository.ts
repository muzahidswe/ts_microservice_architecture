import { EntityRepository, Repository } from "typeorm";
import { MasterProfessionalList } from "../entitites/master-professional-list.entity";

@EntityRepository(MasterProfessionalList)
export class MasterProfessionalListRepository extends Repository<MasterProfessionalList> {
    
}