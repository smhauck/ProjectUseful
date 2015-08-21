class AddFieldsToIssue < ActiveRecord::Migration
  def change
    add_column :issues, :vendor_case_id, :string
    add_column :issues, :vendor_issue_id, :string
    add_column :issues, :reported_to_vendor_at, :datetime
    add_reference :issues, :slas, index: true
    add_column :issues, :vendor_response_due_at, :datetime
    add_column :issues, :vendor_response_actual_at, :datetime
    add_column :issues, :vendor_workaround_due_at, :datetime
    add_column :issues, :vendor_workaround_actual_at, :datetime
    add_column :issues, :vendor_solution_due_at, :datetime
    add_column :issues, :vendor_solution_actual_at, :datetime
    add_column :issues, :impact, :text
  end
end
