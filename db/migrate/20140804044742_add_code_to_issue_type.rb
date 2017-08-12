class AddCodeToIssueType < ActiveRecord::Migration[4.2]
  def change
    add_column :issue_types, :code, :string
  end
end
