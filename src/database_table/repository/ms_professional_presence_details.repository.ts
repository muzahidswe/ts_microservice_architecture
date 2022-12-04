import { EntityRepository, Repository } from "typeorm";
import { ProfessionalPresenceDetails } from "../entitites/ms_professional_presence_details.entity";

@EntityRepository(ProfessionalPresenceDetails)
export class ProfessionalPresenceDetailsRepository extends Repository<ProfessionalPresenceDetails> {
    
}