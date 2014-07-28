class AddAliveToIssueStatusType < ActiveRecord::Migration
  def change
    add_column :issue_status_types, :alive, :boolean
  end
end
