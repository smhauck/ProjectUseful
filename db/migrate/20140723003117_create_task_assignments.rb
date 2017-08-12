class CreateTaskAssignments < ActiveRecord::Migration[4.2]
  def change
    create_table :task_assignments do |t|
      t.references :task, index: true
      t.references :user, index: true

      t.timestamps
    end
  end
end
