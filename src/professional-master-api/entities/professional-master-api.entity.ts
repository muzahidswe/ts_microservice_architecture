import { PrimaryGeneratedColumn, BaseEntity, Column, Entity } from 'typeorm';

export class ProfessionalMasterApi {}

@Entity('CategoryList')
export class CategoryList extends BaseEntity {
  @PrimaryGeneratedColumn()
  category_id: number;

  @Column()
  category_name: string;

  @Column()
  category_name_bn: string;

  @Column()
  category_keyword: string;

  @Column()
  prescription_status: string;
}

@Entity('ProfessionalList')
export class ProfessionalList extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    professional_id: string;

    @Column()
    category_id: number;

    @Column()
    category_name: string;
    
    @Column()
    professional_name: string;

    @Column()
    designation: string;

    @Column()
    department: string;

    @Column()
    division_name: string;
    
    @Column()
    area_name: string;
    
    @Column()
    territory_name: string;
    
    @Column()
    point_name: string;

    @Column()
    academic_background: string;

    @Column()
    visit_fee: number;
}

@Entity('ProfessionalDetails')
export class ProfessionalDetails extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    professional_id: string;

    @Column()
    category_id: number;

    @Column()
    category_name: string;
    
    @Column()
    professional_name: string;

    @Column()
    designation: string;

    @Column()
    department: string;

    @Column()
    contact_person: string;

    @Column()
    mobile_number: string;

    @Column()
    academic_background: string;

    @Column()
    visit_fee: number;

    @Column()
    calendar_type: number;

    @Column()
    chamber: string;
    
    @Column()
    division_name: string;

    @Column()
    area_name: string;
    
    @Column()
    territory_name: string;
    
    @Column()
    point_name: string;

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
    
}