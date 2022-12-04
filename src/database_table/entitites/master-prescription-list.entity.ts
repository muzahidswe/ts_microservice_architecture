import { Column, CreateDateColumn,  Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: "ms_prescription_list"})
export class MasterPrescriptionList {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    professional_id: number;

    @Column()
    prescription_image_count: number;
    
    @Column()
    status: number;
    
    @Column()
    created_by: number;

    @CreateDateColumn({type: 'timestamp'})
    created: Date;

    @Column()
    updated_by: number;

    @CreateDateColumn({type: 'timestamp'})
    updated: Date;

}
