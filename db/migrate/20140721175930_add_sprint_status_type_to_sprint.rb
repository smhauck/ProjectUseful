class AddSprintStatusTypeToSprint < ActiveRecord::Migration[4.2]
  def change
    add_reference :sprints, :sprint_status_type, index: true
  end
end
