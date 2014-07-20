class AddTaskStatusTypeToTask < ActiveRecord::Migration
  def change
    add_reference :tasks, :task_status_type, index: true
    add_column :task_status_types, :alive, :boolean


    TaskStatusType.create(title: "Waiting", alive: "1")
    TaskStatusType.create(title: "In Progress", alive: "1")
    TaskStatusType.create(title: "Testing", alive: "1")
    TaskStatusType.create(title: "Complete", alive: "0")
  end
end
