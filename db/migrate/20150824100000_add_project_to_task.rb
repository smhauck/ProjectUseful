class AddProjectToTask < ActiveRecord::Migration[4.2]
  def change
    add_reference :tasks, :project, index: true
  end
end
