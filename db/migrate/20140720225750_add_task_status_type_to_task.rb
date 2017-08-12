class AddTaskStatusTypeToTask < ActiveRecord::Migration[4.2]
  def change
    add_reference :tasks, :task_status_type, index: true
  end
end
