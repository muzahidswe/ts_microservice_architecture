import { Column, CreateDateColumn,  Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: "ms_prescription_image_details"})
export class PrescriptionImageDetails {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    prescription_id: number;

    @Column()
    image_path: string;

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
