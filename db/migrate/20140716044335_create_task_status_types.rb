class CreateTaskStatusTypes < ActiveRecord::Migration
  def change
    create_table :task_status_types do |t|
      t.boolean :alive
      t.string :title
      t.text :description

      t.timestamps
    end

    TaskStatusType.create(title: "Waiting", alive: "1")
    TaskStatusType.create(title: "In Progress", alive: "1")
    TaskStatusType.create(title: "Testing", alive: "1")
    TaskStatusType.create(title: "Complete", alive: "0")

  end
end
