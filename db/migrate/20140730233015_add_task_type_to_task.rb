class AddTaskTypeToTask < ActiveRecord::Migration[4.2]
  def change
    add_reference :tasks, :task_type, index: true
  end
end
