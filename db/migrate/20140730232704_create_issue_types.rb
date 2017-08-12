class CreateIssueTypes < ActiveRecord::Migration[4.2]
  def change
    create_table :issue_types do |t|
      t.string :title
      t.text :description

      t.timestamps
    end
  end
end
