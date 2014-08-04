class AddCodeToIssueType < ActiveRecord::Migration
  def change
    add_column :issue_types, :code, :string
  end
end
