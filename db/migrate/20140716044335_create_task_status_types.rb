class CreateTaskStatusTypes < ActiveRecord::Migration[4.2]
  def change
    create_table :task_status_types do |t|
      t.boolean :alive
      t.string :title
      t.string :code
      t.text :description

      t.timestamps
    end
  end
end
