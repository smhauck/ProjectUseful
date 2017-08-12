class CreateTaskComments < ActiveRecord::Migration[4.2]
  def change
    create_table :task_comments do |t|
      t.decimal :hours, precision: 5, scale: 2
      t.date :date_of_work
      t.text :comment
      t.references :task, index: true
      t.references :user, index: true

      t.timestamps
    end
  end
end
