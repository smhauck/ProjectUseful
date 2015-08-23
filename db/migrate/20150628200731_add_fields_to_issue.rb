class AddFieldsToIssue < ActiveRecord::Migration
  def up
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

execute <<-SQL
drop trigger if exists issues_bi; 
SQL
execute <<-SQL
drop trigger if exists issues_bu;
SQL
execute <<-SQL
CREATE TRIGGER `issues_bi` BEFORE INSERT ON `issues` FOR EACH ROW begin set new.vendor_response_due_at = new.reported_to_vendor_at + interval (select slas.response_due_at from slas where slas.id = new.slas_id) hour; set new.vendor_workaround_due_at = new.reported_to_vendor_at + interval (select slas.workaround_due_at from slas where slas.id = new.slas_id) hour; set new.vendor_solution_due_at = new.reported_to_vendor_at + interval (select slas.solution_due_at from slas where slas.id = new.slas_id) hour; end ;
SQL
execute <<-SQL
CREATE TRIGGER `issues_bu` BEFORE UPDATE ON `issues` FOR EACH ROW begin set new.vendor_response_due_at = new.reported_to_vendor_at + interval (select slas.response_due_at from slas where slas.id = new.slas_id) hour; set new.vendor_workaround_due_at = new.reported_to_vendor_at + interval (select slas.workaround_due_at from slas where slas.id = new.slas_id) hour; set new.vendor_solution_due_at = new.reported_to_vendor_at + interval (select slas.solution_due_at from slas where slas.id = new.slas_id) hour; end ;
SQL
  end

  def down
    remove_column :issues, :vendor_case_id, :string
    remove_column :issues, :vendor_issue_id, :string
    remove_column :issues, :reported_to_vendor_at, :datetime
    remove_reference :issues, :slas, index: true
    remove_column :issues, :vendor_response_due_at, :datetime
    remove_column :issues, :vendor_response_actual_at, :datetime
    remove_column :issues, :vendor_workaround_due_at, :datetime
    remove_column :issues, :vendor_workaround_actual_at, :datetime
    remove_column :issues, :vendor_solution_due_at, :datetime
    remove_column :issues, :vendor_solution_actual_at, :datetime
    remove_column :issues, :impact, :text

 execute<<-SQL
 drop trigger issues_bi; 
 SQL
 execute<<-SQL
 drop trigger issues_bu;
 SQL
  end
end
