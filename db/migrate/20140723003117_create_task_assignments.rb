class CreateTaskAssignments < ActiveRecord::Migration
  def change
    create_table :task_assignments do |t|
      t.references :task, index: true
      t.references :user, index: true

      t.timestamps
    end
  end
end
