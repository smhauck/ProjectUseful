class AddProjectStatusTypeToProject < ActiveRecord::Migration
  def change
    add_reference :projects, :project_status_type, index: true
  end
end
