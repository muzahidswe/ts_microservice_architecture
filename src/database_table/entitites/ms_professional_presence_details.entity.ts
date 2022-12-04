import { Column, CreateDateColumn,  Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: "ms_professional_presence_details"})
export class ProfessionalPresenceDetails {
	
	@PrimaryGeneratedColumn()
    id: number;
	
	@Column()
    professional_id: number;
	
	@Column()
    presence_weekday: string;

    @Column()
    presence_month_date: string;
	
	@Column()
    visiting_time: string;
	
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
