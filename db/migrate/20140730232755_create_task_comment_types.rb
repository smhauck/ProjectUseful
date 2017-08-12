class CreateTaskCommentTypes < ActiveRecord::Migration[4.2]
  def change
    create_table :task_comment_types do |t|
      t.string :title
      t.text :description

      t.timestamps
    end
  end
end
