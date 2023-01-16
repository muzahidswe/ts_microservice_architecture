import { Column, CreateDateColumn,  Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: "ms_professional_list"})
export class MasterProfessionalList {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    professional_id: string;

    @Column()
    category_id: number;
    
    @Column()
    name: string;

    @Column()
    designation: string;

    @Column()
    department: string;

    @Column()
    organization: string;
    
    @Column()
    contact_person: string;
    
    @Column()
    mobile_number: string;
    
    @Column()
    academic_background: string;

    @Column()
    visit_fee: number;
    
    @Column()
    calendar_type: string;

    @Column()
    chamber: string;

    @Column()
    territory_id: number;

    @Column()
    dep_id: number;

    @Column()
    route_id: number;

    @Column()
    contract_value: number;
    
    @Column()
    contract_tenure: number;

    @Column()
    patients_per_week: number;

    @Column()
    baby_food_prescriptions: number;
    
    @Column()
    prescription_for_mother_smile: number;
    
    @Column()
    image_path: string;

    @Column()
    comments: string;

    @Column()
    activation_status: number;

    @Column()
    request_status: number;

    @CreateDateColumn()
    activation_date: Date;

    @CreateDateColumn()
    request_date: Date;
    
    @Column()
    created_by: number;

    @CreateDateColumn({type: 'timestamp'})
    created: Date;

    @Column()
    updated_by: number;

    @CreateDateColumn({type: 'timestamp'})
    updated: Date;

}
