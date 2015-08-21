class AddStatusToProjects < ActiveRecord::Migration
  def change
    add_reference :projects, :project_status_type, index: true, null: false, default: 1

    reversible do |dir|
      dir.up { Project.update_all project_status_type_id: 1 }
    end
  end
end
