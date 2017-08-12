class AddIssueTypeToIssue < ActiveRecord::Migration[4.2]
  def change
    add_reference :issues, :issue_type, index: true
  end
end
