import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: "token_log"})
export class TokenLog {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    user_id: number;

    @Column()
    user_type: number;

    @Column()
    refreshtoken: string;

    @Column()
    refreshtokenexpires: string;

    @CreateDateColumn({type: 'timestamp'})
    created_at: Date;

    @Column()
    user_agent: string;

    @Column()
    ip_address: string;
}
