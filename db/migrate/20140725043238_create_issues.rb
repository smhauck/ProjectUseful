class CreateIssues < ActiveRecord::Migration[4.2]
  def change
    create_table :issues do |t|
      t.string :title
      t.text :description
      t.integer :requestor_id
      t.references :product, index: true
      t.references :issue_status_type, index: true

      t.timestamps
    end
  end
end
