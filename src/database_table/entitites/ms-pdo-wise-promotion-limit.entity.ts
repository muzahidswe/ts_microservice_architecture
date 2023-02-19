import { Column, CreateDateColumn,  Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: "ms_pdo_wise_promotion_limit"})
export class MsPdoWisePromotionLimit {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    sbu_id: number;

    @Column()
    dep_id: number;
    
    @Column()
    ff_id: number;

    @Column()
    usable_limit: number;

    @Column()
    expenses: number;

    @Column()
    remaining_balance: number;

    @Column()
    month: number;

    @Column()
    year: number;

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
