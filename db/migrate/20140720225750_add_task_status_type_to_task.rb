class AddTaskStatusTypeToTask < ActiveRecord::Migration
  def change
    add_reference :tasks, :task_status_type, index: true
  end
end
