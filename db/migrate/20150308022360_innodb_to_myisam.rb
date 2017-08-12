class InnodbToMyisam < ActiveRecord::Migration[4.2]
  def change
execute <<SQL
alter table products engine=myisam;
SQL
execute <<SQL
alter table stories engine=myisam;
SQL
execute <<SQL
alter table tasks engine=myisam;
SQL
execute <<SQL
alter table sprints engine=myisam;
SQL
execute <<SQL
alter table notes engine=myisam;
SQL
execute <<SQL
alter table stories add fulltext index stories_ft_idx (title, description);
SQL
execute <<SQL
alter table tasks add fulltext index tasks_ft_idx (title, description);
SQL
execute <<SQL
alter table notes add fulltext index notes_ft_idx (title, body);
SQL

  end
end
