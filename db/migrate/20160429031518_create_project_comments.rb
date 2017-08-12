class CreateProjectComments < ActiveRecord::Migration[4.2]
  def change
    create_table :project_comments do |t|
      t.references :user, index: true, foreign_key: true
      t.references :project, index: true, foreign_key: true
      t.text :comment

      t.timestamps null: false
    end
  end
end
