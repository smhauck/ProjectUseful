class AddAliveToIssueStatusType < ActiveRecord::Migration[4.2]
  def change
    add_column :issue_status_types, :alive, :boolean
  end
end
