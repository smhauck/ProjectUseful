class CreateIssueStatusTypes < ActiveRecord::Migration[4.2]
  def change
    create_table :issue_status_types do |t|
      t.string :title
      t.string :code
      t.text :description

      t.timestamps
    end
  end
end
