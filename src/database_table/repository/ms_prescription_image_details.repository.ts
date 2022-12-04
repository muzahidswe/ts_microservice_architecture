import { EntityRepository, Repository } from "typeorm";
import { PrescriptionImageDetails } from "../entitites/ms_prescription_image_details.entity";

@EntityRepository(PrescriptionImageDetails)
export class PrescriptionImageDetailsRepository extends Repository<PrescriptionImageDetails> {
    
}