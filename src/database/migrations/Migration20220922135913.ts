import { Migration } from '@mikro-orm/migrations';

export class Migration20220922135913 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table `user` (`id` int unsigned not null auto_increment primary key, `created_at` datetime not null, `updated_at` datetime null, `email` varchar(255) not null, `hashed_password` varchar(255) not null, `hashed_rt` varchar(255) null) default character set utf8mb4 engine = InnoDB;',
    );
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists `user`;');
  }
}
