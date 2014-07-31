class AddIssueTypeToIssue < ActiveRecord::Migration
  def change
    add_reference :issues, :issue_type, index: true
  end
end
