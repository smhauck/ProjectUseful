class AddCodeToProjectStatusTypes < ActiveRecord::Migration[4.2]
  def up
    add_column :project_status_types, :code, :string

    # update code based on title
    execute <<-SQL
      update project_status_types set code = 'waiting' where title = 'Waiting';
    SQL
    execute <<-SQL
      update project_status_types set code = 'in_progress' where title = 'In Progress';
    SQL
    execute <<-SQL
      update project_status_types set code = 'complete' where title = 'Complete';
    SQL
    execute <<-SQL
      update project_status_types set code = 'cancelled' where title = 'Cancelled';
    SQL
  end

  def down
    remove_column :project_status_types, :code
  end
end
