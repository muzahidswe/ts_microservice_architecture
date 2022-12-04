import { EntityRepository, Repository } from "typeorm";
import { MasterPrescriptionList } from "../entitites/master-prescription-list.entity"

@EntityRepository(MasterPrescriptionList)
export class MasterPrescriptionListRepository extends Repository<MasterPrescriptionList> {
    
}