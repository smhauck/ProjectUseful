class AddSprintStatusTypeToSprint < ActiveRecord::Migration
  def change
    add_reference :sprints, :sprint_status_type, index: true
  end
end
