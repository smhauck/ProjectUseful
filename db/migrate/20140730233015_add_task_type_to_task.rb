class AddTaskTypeToTask < ActiveRecord::Migration
  def change
    add_reference :tasks, :task_type, index: true
  end
end
