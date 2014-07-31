class CreateTaskCommentTypes < ActiveRecord::Migration
  def change
    create_table :task_comment_types do |t|
      t.string :title
      t.text :description

      t.timestamps
    end
  end
end
