import { Column, CreateDateColumn,  Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: "ms_promotion_list"})
export class MasterPromotionEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    promotion_id: string;

    @Column()
    promotion_category_id: number;

    @Column()
    professional_id: number;

    @Column()
    promotion_description: string;

    @Column()
    promotion_value: number;

    @Column()
    usable_value: number;
  
    @Column()
    comments: string;

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
